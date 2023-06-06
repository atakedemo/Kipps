// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract OracleLogicErc20 is ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;
    using SafeMath for uint256;
    using Strings for uint256;
    
    //リクエストに対応する情報の記録
    struct ticketInfo {
        address attempteeAddress;
        address tokenAddress;
        address callerAddress;
        uint256 returnFee;
    }
    mapping(bytes32 => ticketInfo) public requestIdToTicket;
    
    int256 currentTimestamp;
    
    address public contractOwner;
    uint256 private fee;
    address private oracleAddress;
    bytes32 private getMetaJobId;
    bytes32 public currentRequest;
    uint256 public result;

    /**
     * Network: Polygon Mumbai
     *
     * Link Token: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Oracle Address: 0x678173a60d0F098af059E1A0dDF1c29d10A30473
     * GetTime JobId: 
     */
    constructor() {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);

        fee = 1 * 10**18;
        oracleAddress = 0x678173a60d0F098af059E1A0dDF1c29d10A30473;
        getMetaJobId = "2812b204d45a402bb584f6f1aeb9b79e";

        contractOwner = msg.sender;
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function setGetMetaJobId(bytes32 id) public onlyOwner {
        getMetaJobId = id;
    }

    function createGetRequestTo(
        address _tokenAddress,
        address _attempteeAddress,
        uint256 _returnFee
    )
        external
        payable
        returns (bytes32 requestId)
    {   
        Chainlink.Request memory req = buildChainlinkRequest(
            getMetaJobId,
            address(this),
            this.fullfillRequest.selector
        );
        req.add("params", "sample time adapter");
        requestId = sendChainlinkRequestTo(oracleAddress, req, fee);
        currentRequest = requestId;
        requestIdToTicket[requestId].attempteeAddress = _attempteeAddress;
        requestIdToTicket[requestId].tokenAddress = _tokenAddress;
        requestIdToTicket[requestId].callerAddress = msg.sender;
        requestIdToTicket[requestId].returnFee = _returnFee;
    }

    function fullfillRequest(
        bytes32 requestId,
        uint256 _result,
        int256 _timestamp
    ) public recordChainlinkFulfillment(requestId) {
        currentTimestamp = _timestamp;

        //Oracleからの返り値によって処理を制御する（NFT発行 or トークン返却）
        result = _result;
        if (_result == 1) {
            address _tokenAddress = requestIdToTicket[requestId].tokenAddress;
            address _attempteeAddress = requestIdToTicket[requestId].attempteeAddress;
            address _callerAddress = requestIdToTicket[requestId].callerAddress;
            uint256 _returnFee = requestIdToTicket[requestId].returnFee;
            IERC20 _feeToken = IERC20(_tokenAddress);
            _feeToken.transferFrom(_callerAddress, _attempteeAddress, _returnFee);
        }
    }

    function cancelRequest(
        bytes32 requestId,
        bytes4 callbackFunctionId,
        uint256 expiration
    ) public onlyOwner {
        cancelChainlinkRequest(requestId, fee, callbackFunctionId, expiration);
    }

    function withdrawLink() public onlyOwner {
        LinkTokenInterface link = LinkTokenInterface(chainlinkTokenAddress());
        require(
            link.transfer(msg.sender, link.balanceOf(address(this))),
            "Unable to transfer"
        );
    }

    function receiveEther() external payable {
        //TODO: 処理を書く
    }
}