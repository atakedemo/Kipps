// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IOracleLogic {
    function createGetRequestTo(address _tokenAddress,address _attempteeAddress,uint256 _returnFee) external payable returns (bytes32 requestId);
}

contract TicketErc1155 is ERC1155 {
    address public contractOwner;
    uint256 public salesPaid;
    uint256 public ticketCount;

    struct Ticket {
        address feeAddress;
        uint256 feeAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 eventTime;
        uint256 mintLimit;
    }
    mapping (uint256 => Ticket) public ticketList;
    mapping(uint256 => address) public adminList;
    mapping (uint256 => address) public ticketOracleLogic;
    mapping (uint256 => uint256) public ticketSales;

    string baseMetadataURIPrefix;
    string baseMetadataURISuffix;

    event ticketSet(uint256 ticketId);
    event ticketMinted(uint256 ticketId);

    // コントラクトデプロイ時に１度だけ呼ばれる
    constructor() ERC1155("") {
        baseMetadataURIPrefix = "https://dao-org.4attraem.com/metadata/";
        baseMetadataURISuffix = ".json";
        contractOwner = msg.sender;
        salesPaid = 90;
        ticketCount = 0;
    }

    modifier onlyOwner() {
        require(msg.sender == contractOwner, "Caller is not the owner.");
        _;
    }
    
    function uri(uint256 _id) public view override returns (string memory) {
        // "https://~~~" + tokenID + ".json" の文字列結合を行っている
	    return string(abi.encodePacked(
            baseMetadataURIPrefix,
            Strings.toString(_id),
            baseMetadataURISuffix
        ));
    }

    function mintBatch(uint256[] memory _tokenIds, uint256[] memory _amounts) public { 
        require(msg.sender == contractOwner, "you don't have a permission (Error : 403)");
        _mintBatch(msg.sender, _tokenIds, _amounts, "");
    }

    function setBaseMetadataURI(string memory _prefix, string memory _suffix) public { 
        baseMetadataURIPrefix = _prefix;
        baseMetadataURISuffix = _suffix;
    }

    //チケット発行 ※事前に対象のトークンについてApproveしておくことが必要
    function mintTicket(uint256 _ticketId) external {
        require(
            block.timestamp >= ticketList[_ticketId].startTime && block.timestamp <= ticketList[_ticketId].endTime,
            "You can't mint this ticket (not active)"
        );

        address _feeAddress = ticketList[_ticketId].feeAddress;
        uint256 _feeAmount = ticketList[_ticketId].feeAmount;
        IERC20 feeToken = IERC20(_feeAddress);
        require(
            feeToken.balanceOf(msg.sender) >= _feeAmount,
            "Insufficient token balance."
        );

        require(
            feeToken.transferFrom(msg.sender, address(this), _feeAmount),
            "fee transfer failed."
        );

        _mint(msg.sender, _ticketId, 1, "");
        uint256 tmpTicketSales = ticketSales[_ticketId];
        uint256 payAmount = _feeAmount * salesPaid / 100;
        ticketSales[_ticketId] = tmpTicketSales + payAmount;
        emit ticketMinted(_ticketId);
    }

    //チケット使用
    function useTicket(uint256 _ticketId) external {
        // Thicket Not Used(ID=0) => Burn
        _burn(msg.sender, _ticketId, 1);
        // Thicket Used(ID=1) => Mint
        _mint(msg.sender, _ticketId + 1, 1, "");
        // If Oracle contract is registered, pay back (or Mint sorry NFT).
        if (ticketOracleLogic[_ticketId] != address(0)) {
            address _feeAddress = ticketList[_ticketId].feeAddress;
            uint256 _feeAmount = ticketList[_ticketId].feeAmount;
            IERC20 feeToken = IERC20(_feeAddress);
            feeToken.approve(ticketOracleLogic[_ticketId], _feeAmount / 10);

            address _oracleLogic = ticketOracleLogic[_ticketId];
            IOracleLogic oracleLogic = IOracleLogic(_oracleLogic);
            oracleLogic.createGetRequestTo(_feeAddress, msg.sender, _feeAmount / 20);
        }
    }

    //Register new ticket
    function setTicket(
        uint256 _ticketId,
        address _feeAddress,
        uint256 _feeAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _eventTime,
        uint256 _mintLimit
    ) external {
        ticketList[_ticketId].feeAddress = _feeAddress;
        ticketList[_ticketId].feeAmount = _feeAmount * 10 ** 18;
        ticketList[_ticketId].startTime = _startTime;
        ticketList[_ticketId].endTime = _endTime;
        ticketList[_ticketId].eventTime = _eventTime;
        ticketList[_ticketId].mintLimit = _mintLimit;
        adminList[_ticketId] = msg.sender;
        ticketSales[_ticketId] = 0;
        ticketCount = ticketCount + 1;
        emit ticketSet(_ticketId);
    }

    //チケットの登録
    function setTicket(
        uint256 _ticketId,
        address _feeAddress,
        uint256 _feeAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _eventTime,
        uint256 _mintLimit,
        address _oracleAddress
    ) external {
        ticketList[_ticketId].feeAddress = _feeAddress;
        ticketList[_ticketId].feeAmount = _feeAmount * 10 ** 18;
        ticketList[_ticketId].startTime = _startTime;
        ticketList[_ticketId].endTime = _endTime;
        ticketList[_ticketId].eventTime = _eventTime;
        ticketList[_ticketId].mintLimit = _mintLimit;
        adminList[_ticketId] = msg.sender;
        ticketSales[_ticketId] = 0;
        ticketOracleLogic[_ticketId] = _oracleAddress;
        emit ticketSet(_ticketId);
        ticketCount = ticketCount + 1;
    }

    //チケット別の管理者の設定
    function updateTicketAdmin(uint256 _ticketId, address _newAdmin) external {
        require(msg.sender == adminList[_ticketId]);
        adminList[_ticketId] = _newAdmin;
    }

    //チケット別のオラクルコントラクトの設定
    function setOracleContract(uint256 _ticketId, address _logicAddress) external {
        require(msg.sender == adminList[_ticketId]);
        ticketOracleLogic[_ticketId] = _logicAddress;
    }

    //チケット別の設定変更
    function updateTicket(
        uint256 _ticketId,
        address _feeAddress,
        uint256 _feeAmount,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _eventTime,
        uint256 _mintLimit
    ) external {
        require(msg.sender == adminList[_ticketId], "You can't withdraw sales (Unauthorized)");
        ticketList[_ticketId].feeAddress = _feeAddress;
        ticketList[_ticketId].feeAmount = _feeAmount * 10 ** 18;
        ticketList[_ticketId].startTime = _startTime;
        ticketList[_ticketId].endTime = _endTime;
        ticketList[_ticketId].eventTime = _eventTime;
        ticketList[_ticketId].mintLimit = _mintLimit;
        emit ticketSet(_ticketId);
    }

    //チケット販売売り上げの引き出し
    function withdrawSales (uint256 _ticketId, uint256 _amount) external {
        require(msg.sender == adminList[_ticketId], "You can't withdraw sales (Unauthorized)");
        require(ticketSales[_ticketId] >= _amount, "Insufficient sales balance");
        require(block.timestamp >= ticketList[_ticketId].eventTime,"You can't withdraw sales yet (event not start)");
        address _feeAddress = ticketList[_ticketId].feeAddress;
        IERC20 feeToken = IERC20(_feeAddress);
        bool success = feeToken.transfer(msg.sender, _amount);
        require(success, "Token transfer failed");
    }

    //トークンの引き出し（コントラクト管理者）
    function withdrawToken (address _tokenAddress, uint256 _amount) public onlyOwner {
        IERC20 feeToken = IERC20(_tokenAddress);
        require(feeToken.balanceOf(address(this)) >= _amount, "Insufficient sales balance");
        require(feeToken.transfer(msg.sender, _amount), 'Unable withdraw');
    }
}