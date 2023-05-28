// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract TicketErc1155 is ERC1155 {

    address public contractOwner;
    uint256 public salesPaid;

    //チケットの基本情報
    struct Ticket {
        address feeAddress;
        uint256 feeAmount;
        uint256 startTime;
        uint256 endTime;
        uint256 eventTime;
        uint256 mintLimit;
    }
    mapping (uint256 => Ticket) public ticketList;

    //チケット別の管理者（発行者）管理
    mapping(uint256 => address) public adminList;

    //チケット別の参照先オラクルの設定 *返り値はTrue/False
    mapping (uint256 => address) public ticketOracleLogic;

    //チケット別の売り上げ管理
    mapping (uint256 => uint256) public ticketSales;

    string baseMetadataURIPrefix;
    string baseMetadataURISuffix;

    // コントラクトデプロイ時に１度だけ呼ばれる
    constructor() ERC1155("") {
        baseMetadataURIPrefix = "https://dao-org.4attraem.com/metadata/";
        baseMetadataURISuffix = ".json";
        contractOwner = msg.sender;
        salesPaid = 90;
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
    }

    //チケット使用
    function useTicket(uint256 _ticketId) external {
        // ID=0のチケットのBurn
        _burn(msg.sender, _ticketId, 1);
        // ID=1のチケットのMint
        _mint(msg.sender, _ticketId + 1, 1, "");
        // Oracleを参照し、登録されているなら実行
        /*
        if (ticketOracleLogic[_ticketId] != address(0)) {
            
        }
        */
    }

    //以下、設定系のFunction（イベントの管理者が使うもの）
    //チケットの登録
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
        ticketList[_ticketId].feeAmount = _feeAmount * 10^18;
        ticketList[_ticketId].startTime = _startTime;
        ticketList[_ticketId].endTime = _endTime;
        ticketList[_ticketId].eventTime = _eventTime;
        ticketList[_ticketId].mintLimit = _mintLimit;
        adminList[_ticketId] = msg.sender;
        ticketSales[_ticketId] = 0;
    }

    //チケット別の管理者の設定
    function updateTicketAdmin(uint256 _ticketId, address _newAdmin) external {
        require(msg.sender != adminList[_ticketId]);
        adminList[_ticketId] = _newAdmin;
    }

    //チケット別のオラクルコントラクトの設定
    function setOracleContract(uint256 _ticketId, address _logicAddress) external {
        require(msg.sender != adminList[_ticketId]);
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
        ticketList[_ticketId].feeAmount = _feeAmount * 10^18;
        ticketList[_ticketId].startTime = _startTime;
        ticketList[_ticketId].endTime = _endTime;
        ticketList[_ticketId].eventTime = _eventTime;
        ticketList[_ticketId].mintLimit = _mintLimit;
    }

    //チケット販売売り上げの引き出し
    function withdrawSales (uint256 _ticketId, uint256 _amount) external {
        require(msg.sender == adminList[_ticketId], "You can't withdraw sales (Unauthorized)");
        require(ticketSales[_ticketId] >= _amount, "Insufficient sales balance");
        require(block.timestamp <= ticketList[_ticketId].eventTime,"You can't withdraw sales yet (event not start)");
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