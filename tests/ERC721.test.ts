// import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect, use as chaiUse } from "chai";
import chaiAsPromised from "chai-as-promised";
import { ethers } from "hardhat";
import { ERC721DrunkRobotsGenesisZero } from "../typechain";
chaiUse(chaiAsPromised);

const ONE_ETH = ethers.utils.parseEther("1");

describe("ERC721DrunkRobotsGenesisZero", async function () {
  const BASE_URI = "http://dummy.url/";
  const ZERO_TOKEN_URI = `${BASE_URI}0.json`;

  const NAME = "Drunk Robots Genesis Zero";
  const SYMBOL = "DR0";
  const MAX_SUPPLY = 50;

  let nft: ERC721DrunkRobotsGenesisZero;
  let accounts: SignerWithAddress[];

  let deployer: SignerWithAddress; // owner of the Contract
  let accountX: SignerWithAddress; // any account which is not owner of the contract

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    deployer = accounts[0];
    accountX = accounts[1];

    const drunkRobotsGenesis = await ethers.getContractFactory(
      "ERC721DrunkRobotsGenesisZero"
    );
    nft = await drunkRobotsGenesis.deploy(BASE_URI);
  });

  /***** test case 1 ******/
  describe("deploy contract, test state values:", () => {
    it("name", async () => {
      expect(await nft.name()).to.eq(NAME);
    });

    it("symbol", async () => {
      expect(await nft.symbol()).to.eq(SYMBOL);
    });
    it("base url", async () => {
      expect(await nft.symbol()).to.eq(SYMBOL);
    });

    it("max supply", async () => {
      expect(await nft.maxSupply()).to.eq(MAX_SUPPLY);
    });
  });

  /***** test case 2 ******/
  describe("deploy contract, test mint", () => {
    it("should not allow to mint when caller is not owner ", async () => {
      await expect(
        nft.connect(accountX).mint(accountX.address, 1)
      ).to.revertedWith("Ownable: caller is not the owner");
    });

    it("should allow to mint when the caller is owner", async () => {
      const TransferEventArgs = [
        ethers.constants.AddressZero,
        accountX.address,
        0,
      ];
      await expect(nft.mint(accountX.address, 1))
        .to.emit(nft, "Transfer")
        .withArgs(...TransferEventArgs);
    });
  });

  /***** test case 3 ******/
  describe("deploy contract, test mint", () => {
    const mintVolume = 1;
    beforeEach(async () => {
      await nft.mint(deployer.address, mintVolume);
    });
    it("total supply ", async () => {
      expect(await nft.totalSupply()).to.eq(mintVolume);
    });

    it("balance of", async () => {
      expect(await nft.balanceOf(deployer.address)).to.eq(mintVolume);
    });

    it("should run base uri for the token", async () => {
      expect(await nft.tokenURI(0)).to.be.equal(ZERO_TOKEN_URI);
    });
  });

  /***** test case 4 ******/
  describe("deploy contract, royalties update", () => {
    /***** test case 4.1 ******/
    describe("update royalties Amount", () => {
      it("not owner ", async () => {
        await expect(nft.connect(accountX).setRoyalties("0")).to.revertedWith(
          "Ownable: caller is not the owner"
        );
      });

      it("should revert for percentage 0 ", async () => {
        await expect(nft.setRoyalties("0")).to.revertedWith(
          "royalties should be more than 0"
        );
      });

      it("royalty amount", async () => {
        const royalties = 10; // royalties percentage
        await nft.setRoyalties(royalties);

        let royaltyAmount = null;
        await nft.mint(deployer.address, 1);
        ({ royaltyAmount } = await nft.royaltyInfo("0", ONE_ETH));
        const percentage = 1 * (royalties / 100);
        expect(royaltyAmount).to.be.eq(
          ethers.utils.parseEther(percentage.toString())
        );
      });
    });

    /***** test case 4.2 ******/
    describe(" update royalties receiver", () => {
      it("not owner ", async () => {
        await expect(
          nft.connect(accountX).setRoyaltiesReceiver(accountX.address)
        ).to.revertedWith("Ownable: caller is not the owner");
      });

      it("update royalites receiver ", async () => {
        await nft.setRoyaltiesReceiver(accountX.address);

        await nft.mint(accountX.address, 1);
        let { receiver } = await nft.royaltyInfo("0", ONE_ETH);

        expect(receiver).to.be.eq(accountX.address);
      });
    });
  });

  /***** test case 5 ******/
  describe("deploy contract, test supports interfaces", () => {
    // the interface id can be foud on the eip page https://eips.ethereum.org/EIPS/eip-721
    it("supports the IERC721 interface", async () => {
      expect(await nft.supportsInterface("0x80ac58cd")).to.be.equal(true);
    });

    it("supports the IERC721Metadata interface", async () => {
      expect(await nft.supportsInterface("0x5b5e139f")).to.be.equal(true);
    });

    it("supports the IERC165 interface", async () => {
      expect(await nft.supportsInterface("0x01ffc9a7")).to.be.equal(true);
    });

    it("supports the IERC2981 interface", async () => {
      expect(await nft.supportsInterface("0x2a55205a")).to.be.equal(true);
    });
  });

  /***** test case 6 ******/
  describe("deploy contract, mint all tokens", () => {
    beforeEach(async () => {
      await nft.mint(deployer.address, MAX_SUPPLY);
    });
    it("total supply should be equal to max supply", async () => {
      expect(await nft.totalSupply()).to.eq(MAX_SUPPLY);
    });
    it("balace of caller should be equal to max supply", async () => {
      expect(await nft.balanceOf(deployer.address)).to.eq(MAX_SUPPLY);
    });
  });

  /***** test case 7 ******/
  describe("deploy contract, transfer ownership", () => {
    it("update the owner", async () => {
      await nft.transferOwnership(accountX.address);
      expect(await nft.owner()).to.eq(accountX.address);
    });

    it("should enable new owner to mint", async () => {
      const volume = 10;
      await nft.mint(accountX.address, 10);
      expect(await nft.balanceOf(accountX.address)).to.eq(volume);
    });
  });
});
