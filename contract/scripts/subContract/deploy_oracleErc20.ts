import { ethers } from "hardhat";

async function main() {
  const TargetContract = await ethers.getContractFactory("OracleLogicErc20");
  const contract = await TargetContract.deploy();

  await contract.deployed();

  console.log(`Contract deployed to ${contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});