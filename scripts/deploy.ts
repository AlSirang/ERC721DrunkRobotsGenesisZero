import { ethers } from "hardhat";

async function main() {
  const baseTokenURI = "https://gateway.pinata.cloud/ipfs/";

  const ERC721DrunkRobotsGenesisZero = await ethers.getContractFactory(
    "ERC721DrunkRobotsGenesisZero"
  );
  const erc721 = await ERC721DrunkRobotsGenesisZero.deploy(baseTokenURI);

  await erc721.deployed();

  console.log("ERC721DrunkRobotsGenesisZero:", erc721.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
