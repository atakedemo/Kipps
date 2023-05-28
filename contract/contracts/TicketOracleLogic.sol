// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";

contract UseOracleNft is ERC721URIStorage, ChainlinkClient, Ownable {
    using Chainlink for Chainlink.Request;
    using SafeMath for uint256;
    using Counters for Counters.Counter;
    using Strings for uint256;
    
    //リクエストに対応する情報の記録
    mapping(bytes32 => address) public requestIdToAttemptee;
    mapping(bytes32 => uint256) public requestIdToTokenId;
    uint256 public tokenCounter;
    int256 currentTimestamp;
    string nftMetadata;
    
    address public contractOwner;
    uint256 private fee;
    address private oracleAddress;
    bytes32 private getMetaJobId;

    /**
     * Network: Polygon Mumbai
     *
     * Link Token: 0x326C977E6efc84E512bB9C30f76E30c160eD06FB
     * Oracle Address: 0x678173a60d0F098af059E1A0dDF1c29d10A30473
     * GetTime JobId: 
     */
    constructor() 
        ERC721("Chainlink Sample NFT", "chNFT")
    {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);

        fee = 1 * 10**18;
        oracleAddress = 0x678173a60d0F098af059E1A0dDF1c29d10A30473;
        getMetaJobId = "ae5d140e6dce4010a6b142c9275159b6";

        contractOwner = msg.sender;
    }

    function getChainlinkToken() public view returns (address) {
        return chainlinkTokenAddress();
    }

    function setGetMetaJobId(bytes32 id) public onlyOwner {
        getMetaJobId = id;
    }

    function createGetMetaRequestTo()
        public
        payable
        onlyOwner
        returns (bytes32 requestId)
    {
        //_safeMint(msg.sender, tokenCounter);
        //approve(address(this), tokenCounter);
        
        Chainlink.Request memory req = buildChainlinkRequest(
            getMetaJobId,
            address(this),
            this.fulfillGetMetadata.selector
        );
        req.add("params", "sample time adapter");
        requestId = sendChainlinkRequestTo(oracleAddress, req, fee);
        requestIdToAttemptee[requestId] = msg.sender;
        requestIdToTokenId[requestId] = tokenCounter;
        tokenCounter = tokenCounter + 1;
    }

    function fulfillGetMetadata(
        bytes32 requestId,
        string memory _token_url,
        int256 _timestamp
    ) public recordChainlinkFulfillment(requestId) {
        address _owner = requestIdToAttemptee[requestId];
        require(_owner != address(0));
        uint256 _tokenId = requestIdToTokenId[requestId];
        currentTimestamp = _timestamp;
        //Oracleからの返り値によって処理を制御する（NFT発行 or トークン返却）
        //nftMetadata = _token_url;
        //_setTokenURI(_tokenId, _token_url);
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