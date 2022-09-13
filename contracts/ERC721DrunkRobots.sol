// SPDX-License-Identifier: MIT

pragma solidity 0.8.12;

import "erc721a/contracts/extensions/ERC721AQueryable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/interfaces/IERC2981.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract ERC721DrunkRobotsGenesisZero is ERC721AQueryable, Ownable, IERC2981 {
    using Strings for uint256;
    uint16 public constant maxSupply = 50;
    uint16 private royalties = 500; // royalties for secondary sale
    string public baseURI;
    address private royaltiesReceiver;

    /**
     * @dev mint function only callable by the Contract owner. It will mint from reserve tokens for owner
     * @param to is the address to which the tokens will be minted
     * @param amount is the quantity of tokens to be minted
     */
    function mint(address to, uint16 amount) external onlyOwner {
        require(
            (totalSupply() + amount) <= maxSupply,
            "Request will exceed max supply!"
        );

        _safeMint(to, amount);
    }

    /**
     * @dev it will update baseURI for tokens
     * @param _uri is new URI for tokens
     */
    function setBaseURI(string memory _uri) external onlyOwner {
        baseURI = _uri;
    }

    /**
     * @dev it is only callable by Contract owner. it will withdraw balace of contract
     */
    function withdrawBalance() external onlyOwner {
        bool success = payable(msg.sender).send(address(this).balance);
        require(success, "withdraw failed");
    }

    /**
     * @dev it will update the address for royalties receiver
     * @param _royaltiesReceiver is new royalty receiver
     */
    function setRoyaltiesReceiver(address _royaltiesReceiver)
        external
        onlyOwner
    {
        require(_royaltiesReceiver != address(0));
        royaltiesReceiver = _royaltiesReceiver;
    }

    /**
     * @dev it will update the royalties for token
     * @param _royalties is new percentage of royalties. it should be more than 0 and least 90
     */
    function setRoyalties(uint16 _royalties) external onlyOwner {
        require(_royalties > 0, "royalties should be more than 0");
        royalties = (_royalties * 100); // convert percentage into bps
    }

    /******************************/
    /****** VIEW FUNCTIONS ********/
    /******************************/

    /**
     * @dev it will return tokenURI for given tokenIdToOwner
     * @param _tokenId is valid token id mint in this contract
     */
    function tokenURI(uint256 _tokenId)
        public
        view
        override(ERC721A, IERC721A)
        returns (string memory)
    {
        require(
            _exists(_tokenId),
            "ERC721Metadata: URI query for nonexistent token"
        );
        return string(abi.encodePacked(baseURI, _tokenId.toString(), ".json"));
    }

    function supportsInterface(bytes4 _interfaceId)
        public
        view
        virtual
        override(ERC721A, IERC721A, IERC165)
        returns (bool)
    {
        return
            _interfaceId == type(IERC2981).interfaceId ||
            super.supportsInterface(_interfaceId);
    }

    /**
     *  @dev it retruns the amount of royalty the owner will receive for given tokenId
     *  @param _tokenId is valid token number
     *  @param _salePrice is amount for which token will be traded
     */
    function royaltyInfo(uint256 _tokenId, uint256 _salePrice)
        external
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        require(
            _exists(_tokenId),
            "ERC2981RoyaltyStandard: Royalty info for nonexistent token"
        );
        return (royaltiesReceiver, (_salePrice * royalties) / 10000);
    }

    constructor(string memory _uri)
        ERC721A("Drunk Robots Gennesis Zero", "DR0")
    {
        baseURI = _uri;
        royaltiesReceiver = msg.sender;
    }
}
