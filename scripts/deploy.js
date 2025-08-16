const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", deployer.address);

  // Deploy mock USDC token for testing
  const MockUSDC = await ethers.getContractFactory("MockUSDC");
  const mockUSDC = await MockUSDC.deploy();
  await mockUSDC.waitForDeployment();
  console.log("MockUSDC deployed to:", await mockUSDC.getAddress());

  // Deploy the vault
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy(
    await mockUSDC.getAddress(),
    "DeFi Vault Pro USDC",
    "vUSDC"
  );
  await vault.waitForDeployment();
  console.log("Vault deployed to:", await vault.getAddress());

  // Deploy Compound strategy
  const CompoundStrategy = await ethers.getContractFactory("CompoundStrategy");
  const compoundStrategy = await CompoundStrategy.deploy(
    await mockUSDC.getAddress(),
    await vault.getAddress()
  );
  await compoundStrategy.waitForDeployment();
  console.log("CompoundStrategy deployed to:", await compoundStrategy.getAddress());

  // Deploy Uniswap strategy
  const UniswapStrategy = await ethers.getContractFactory("UniswapStrategy");
  const uniswapStrategy = await UniswapStrategy.deploy(
    await mockUSDC.getAddress(),
    await vault.getAddress()
  );
  await uniswapStrategy.waitForDeployment();
  console.log("UniswapStrategy deployed to:", await uniswapStrategy.getAddress());

  // Add strategies to vault
  await vault.addStrategy(
    await compoundStrategy.getAddress(),
    "Compound Strategy",
    200 // 2% performance fee
  );
  console.log("Compound strategy added to vault");

  await vault.addStrategy(
    await uniswapStrategy.getAddress(),
    "Uniswap V3 Strategy",
    300 // 3% performance fee
  );
  console.log("Uniswap strategy added to vault");

  // Mint some USDC to deployer for testing
  await mockUSDC.mint(deployer.address, ethers.parseUnits("1000000", 6)); // 1M USDC
  console.log("Minted 1M USDC to deployer");

  console.log("\nDeployment Summary:");
  console.log("===================");
  console.log("MockUSDC:", await mockUSDC.getAddress());
  console.log("Vault:", await vault.getAddress());
  console.log("CompoundStrategy:", await compoundStrategy.getAddress());
  console.log("UniswapStrategy:", await uniswapStrategy.getAddress());
  console.log("\nNext steps:");
  console.log("1. Approve USDC spending for vault");
  console.log("2. Deposit USDC into vault");
  console.log("3. Test yield generation");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
