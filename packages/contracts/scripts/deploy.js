require("dotenv").config();

const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  // ============================================================
  // GET ETHERS
  // ============================================================

  const { ethers } = hre;

  // ============================================================
  // CONFIGURATION
  // ============================================================

  const [admin] = await ethers.getSigners();

  const relayerAddress = process.env.RELAYER_ADDRESS;
  const quoteSignerAddress = process.env.QUOTE_SIGNER_ADDRESS;

  if (!relayerAddress) {
    throw new Error("RELAYER_ADDRESS is missing from .env");
  }

  if (!quoteSignerAddress) {
    throw new Error("QUOTE_SIGNER_ADDRESS is missing from .env");
  }

  if (!ethers.isAddress(relayerAddress)) {
    throw new Error(`Invalid RELAYER_ADDRESS: ${relayerAddress}`);
  }

  if (!ethers.isAddress(quoteSignerAddress)) {
    throw new Error(`Invalid QUOTE_SIGNER_ADDRESS: ${quoteSignerAddress}`);
  }

  // ============================================================
  // NETWORK CHECK
  // ============================================================

  const networkInfo = await ethers.provider.getNetwork();

  console.log("");
  console.log("==========================================");
  console.log("        PAPERDEX DEPLOYMENT");
  console.log("==========================================");

  console.log("Network:", networkInfo.name);

  console.log("Chain ID:", networkInfo.chainId.toString());

  // Sepolia = 11155111
  if (networkInfo.chainId !== 11155111n) {
    throw new Error(
      `Wrong network! Expected Sepolia (11155111), got ${networkInfo.chainId}`,
    );
  }

  // ============================================================
  // ADMIN BALANCE
  // ============================================================

  const adminBalance = await ethers.provider.getBalance(admin.address);

  console.log("Admin:", admin.address);

  console.log("Admin Sepolia ETH:", ethers.formatEther(adminBalance));

  if (adminBalance === 0n) {
    throw new Error("Admin wallet has no Sepolia ETH.");
  }

  console.log("Relayer:", relayerAddress);

  console.log("Quote Signer:", quoteSignerAddress);

  // ============================================================
  // 1. DEPLOY USDTP
  // ============================================================

  console.log("");
  console.log("1. Deploying USDTP...");

  const PaperUSD = await ethers.getContractFactory("PaperUSD");

  const usdtp = await PaperUSD.deploy(admin.address);

  await usdtp.waitForDeployment();

  const usdtpAddress = await usdtp.getAddress();

  console.log("USDTP:", usdtpAddress);

  // ============================================================
  // 2. DEPLOY BTCP
  // ============================================================

  console.log("");
  console.log("2. Deploying BTCP...");

  const PaperToken = await ethers.getContractFactory("PaperToken");

  const btcp = await PaperToken.deploy("Bitcoin Paper", "BTCP", admin.address);

  await btcp.waitForDeployment();

  const btcpAddress = await btcp.getAddress();

  console.log("BTCP:", btcpAddress);

  // ============================================================
  // 3. DEPLOY ETHP
  // ============================================================

  console.log("");
  console.log("3. Deploying ETHP...");

  const ethp = await PaperToken.deploy("Ethereum Paper", "ETHP", admin.address);

  await ethp.waitForDeployment();

  const ethpAddress = await ethp.getAddress();

  console.log("ETHP:", ethpAddress);

  // ============================================================
  // 4. DEPLOY SOLP
  // ============================================================

  console.log("");
  console.log("4. Deploying SOLP...");

  const solp = await PaperToken.deploy("Solana Paper", "SOLP", admin.address);

  await solp.waitForDeployment();

  const solpAddress = await solp.getAddress();

  console.log("SOLP:", solpAddress);

  // ============================================================
  // 5. DEPLOY VAULT
  // ============================================================

  console.log("");
  console.log("5. Deploying PaperDEXVault...");

  const PaperDEXVault = await ethers.getContractFactory("PaperDEXVault");

  const vault = await PaperDEXVault.deploy(admin.address);

  await vault.waitForDeployment();

  const vaultAddress = await vault.getAddress();

  console.log("Vault:", vaultAddress);

  // ============================================================
  // 6. DEPLOY PAPERDEX
  // ============================================================

  console.log("");
  console.log("6. Deploying PaperDEX...");

  const PaperDEX = await ethers.getContractFactory("PaperDEX");

  const dex = await PaperDEX.deploy(
    usdtpAddress,
    vaultAddress,
    admin.address,
    relayerAddress,
    quoteSignerAddress,
  );

  await dex.waitForDeployment();

  const dexAddress = await dex.getAddress();

  console.log("PaperDEX:", dexAddress);

  // ============================================================
  // 7. GET ROLE IDS
  // ============================================================

  console.log("");
  console.log("7. Reading role identifiers...");

  const btcpExchangeRole = await btcp.EXCHANGE_ROLE();

  const ethpExchangeRole = await ethp.EXCHANGE_ROLE();

  const solpExchangeRole = await solp.EXCHANGE_ROLE();

  const usdtpExchangeRole = await usdtp.EXCHANGE_ROLE();

  const onboardingRole = await usdtp.ONBOARDING_ROLE();

  const vaultExchangeRole = await vault.EXCHANGE_ROLE();

  console.log("BTCP EXCHANGE_ROLE:", btcpExchangeRole);

  console.log("ETHP EXCHANGE_ROLE:", ethpExchangeRole);

  console.log("SOLP EXCHANGE_ROLE:", solpExchangeRole);

  console.log("USDTP EXCHANGE_ROLE:", usdtpExchangeRole);

  console.log("Vault EXCHANGE_ROLE:", vaultExchangeRole);

  // ============================================================
  // 8. BTCP → PAPERDEX
  // ============================================================

  console.log("");
  console.log("8. Granting BTCP EXCHANGE_ROLE...");

  let tx = await btcp.grantRole(btcpExchangeRole, dexAddress);

  await tx.wait();

  console.log("BTCP role granted.");

  // ============================================================
  // 9. ETHP → PAPERDEX
  // ============================================================

  console.log("");
  console.log("9. Granting ETHP EXCHANGE_ROLE...");

  tx = await ethp.grantRole(ethpExchangeRole, dexAddress);

  await tx.wait();

  console.log("ETHP role granted.");

  // ============================================================
  // 10. SOLP → PAPERDEX
  // ============================================================

  console.log("");
  console.log("10. Granting SOLP EXCHANGE_ROLE...");

  tx = await solp.grantRole(solpExchangeRole, dexAddress);

  await tx.wait();

  console.log("SOLP role granted.");

  // ============================================================
  // 11. USDTP → PAPERDEX
  // ============================================================

  console.log("");
  console.log("11. Granting USDTP EXCHANGE_ROLE...");

  tx = await usdtp.grantRole(usdtpExchangeRole, dexAddress);

  await tx.wait();

  console.log("USDTP role granted.");

  // ============================================================
  // 12. VAULT → PAPERDEX
  // ============================================================

  console.log("");
  console.log("12. Granting Vault EXCHANGE_ROLE...");

  tx = await vault.grantRole(vaultExchangeRole, dexAddress);

  await tx.wait();

  console.log("Vault role granted.");

  // ============================================================
  // 13. RELAYER → ONBOARDING
  // ============================================================

  console.log("");
  console.log("13. Granting Relayer ONBOARDING_ROLE...");

  tx = await usdtp.grantRole(onboardingRole, relayerAddress);

  await tx.wait();

  console.log("Relayer onboarding role granted.");

  // ============================================================
  // 14. REGISTER BTCP
  // ============================================================

  console.log("");
  console.log("14. Registering BTCP...");

  tx = await dex.addSupportedToken(btcpAddress);

  await tx.wait();

  console.log("BTCP registered.");

  // ============================================================
  // 15. REGISTER ETHP
  // ============================================================

  console.log("");
  console.log("15. Registering ETHP...");

  tx = await dex.addSupportedToken(ethpAddress);

  await tx.wait();

  console.log("ETHP registered.");

  // ============================================================
  // 16. REGISTER SOLP
  // ============================================================

  console.log("");
  console.log("16. Registering SOLP...");

  tx = await dex.addSupportedToken(solpAddress);

  await tx.wait();

  console.log("SOLP registered.");

  // ============================================================
  // 17. FUND VAULT — USDTP
  // ============================================================

  console.log("");
  console.log("17. Funding Vault with USDTP...");

  const initialUSDTP = ethers.parseEther("1000000000");

  tx = await usdtp.mint(vaultAddress, initialUSDTP);

  await tx.wait();

  console.log("Vault received 1,000,000,000 USDTP.");

  // ============================================================
  // 18. FUND VAULT — BTCP
  // ============================================================

  console.log("");
  console.log("18. Funding Vault with BTCP...");

  const initialBTCP = ethers.parseEther("10000");

  tx = await btcp.mint(vaultAddress, initialBTCP);

  await tx.wait();

  console.log("Vault received 10,000 BTCP.");

  // ============================================================
  // 19. FUND VAULT — ETHP
  // ============================================================

  console.log("");
  console.log("19. Funding Vault with ETHP...");

  const initialETHP = ethers.parseEther("100000");

  tx = await ethp.mint(vaultAddress, initialETHP);

  await tx.wait();

  console.log("Vault received 100,000 ETHP.");

  // ============================================================
  // 20. FUND VAULT — SOLP
  // ============================================================

  console.log("");
  console.log("20. Funding Vault with SOLP...");

  const initialSOLP = ethers.parseEther("5000000");

  tx = await solp.mint(vaultAddress, initialSOLP);

  await tx.wait();

  console.log("Vault received 5,000,000 SOLP.");

  // ============================================================
  // VERIFY VAULT BALANCES
  // ============================================================

  console.log("");
  console.log("==========================================");
  console.log("          VERIFYING VAULT");
  console.log("==========================================");

  const vaultUSDTP = await usdtp.balanceOf(vaultAddress);

  const vaultBTCP = await btcp.balanceOf(vaultAddress);

  const vaultETHP = await ethp.balanceOf(vaultAddress);

  const vaultSOLP = await solp.balanceOf(vaultAddress);

  console.log("USDTP:", ethers.formatEther(vaultUSDTP));

  console.log("BTCP:", ethers.formatEther(vaultBTCP));

  console.log("ETHP:", ethers.formatEther(vaultETHP));

  console.log("SOLP:", ethers.formatEther(vaultSOLP));

  // ============================================================
  // VERIFY ROLES
  // ============================================================

  console.log("");
  console.log("==========================================");
  console.log("          VERIFYING ROLES");
  console.log("==========================================");

  const dexHasBTCPRole = await btcp.hasRole(btcpExchangeRole, dexAddress);

  const dexHasETHPRole = await ethp.hasRole(ethpExchangeRole, dexAddress);

  const dexHasSOLPRole = await solp.hasRole(solpExchangeRole, dexAddress);

  const dexHasUSDTPRole = await usdtp.hasRole(usdtpExchangeRole, dexAddress);

  const dexHasVaultRole = await vault.hasRole(vaultExchangeRole, dexAddress);

  const relayerHasOnboardingRole = await usdtp.hasRole(
    onboardingRole,
    relayerAddress,
  );

  console.log("DEX → BTCP:", dexHasBTCPRole);

  console.log("DEX → ETHP:", dexHasETHPRole);

  console.log("DEX → SOLP:", dexHasSOLPRole);

  console.log("DEX → USDTP:", dexHasUSDTPRole);

  console.log("DEX → VAULT:", dexHasVaultRole);

  console.log("RELAYER → ONBOARDING:", relayerHasOnboardingRole);

  // ============================================================
  // VERIFY SUPPORTED TOKENS
  // ============================================================

  console.log("");
  console.log("==========================================");
  console.log("       VERIFYING SUPPORTED TOKENS");
  console.log("==========================================");

  const btcpSupported = await dex.supportedTokens(btcpAddress);

  const ethpSupported = await dex.supportedTokens(ethpAddress);

  const solpSupported = await dex.supportedTokens(solpAddress);

  console.log("BTCP:", btcpSupported);

  console.log("ETHP:", ethpSupported);

  console.log("SOLP:", solpSupported);

  // ============================================================
  // FINAL VALIDATION
  // ============================================================

  if (!dexHasBTCPRole) {
    throw new Error("PaperDEX does not have BTCP EXCHANGE_ROLE");
  }

  if (!dexHasETHPRole) {
    throw new Error("PaperDEX does not have ETHP EXCHANGE_ROLE");
  }

  if (!dexHasSOLPRole) {
    throw new Error("PaperDEX does not have SOLP EXCHANGE_ROLE");
  }

  if (!dexHasUSDTPRole) {
    throw new Error("PaperDEX does not have USDTP EXCHANGE_ROLE");
  }

  if (!dexHasVaultRole) {
    throw new Error("PaperDEX does not have Vault EXCHANGE_ROLE");
  }

  if (!relayerHasOnboardingRole) {
    throw new Error("Relayer does not have ONBOARDING_ROLE");
  }

  if (!btcpSupported) {
    throw new Error("BTCP is not supported");
  }

  if (!ethpSupported) {
    throw new Error("ETHP is not supported");
  }

  if (!solpSupported) {
    throw new Error("SOLP is not supported");
  }

  // ============================================================
  // SAVE DEPLOYMENT
  // ============================================================

  const deployment = {
    network: networkInfo.name,

    chainId: networkInfo.chainId.toString(),

    deployedAt: new Date().toISOString(),

    admin: admin.address,

    relayer: relayerAddress,

    quoteSigner: quoteSignerAddress,

    contracts: {
      USDTP: usdtpAddress,

      BTCP: btcpAddress,

      ETHP: ethpAddress,

      SOLP: solpAddress,

      PaperDEXVault: vaultAddress,

      PaperDEX: dexAddress,
    },

    vaultLiquidity: {
      USDTP: "1000000000",

      BTCP: "10000",

      ETHP: "100000",

      SOLP: "5000000",
    },
  };

  // ============================================================
  // SAVE FILE
  // ============================================================

  const deploymentDirectory = path.join(process.cwd(), "deployments");

  if (!fs.existsSync(deploymentDirectory)) {
    fs.mkdirSync(deploymentDirectory, {
      recursive: true,
    });
  }

  const deploymentFile = path.join(deploymentDirectory, "sepolia.json");

  fs.writeFileSync(deploymentFile, JSON.stringify(deployment, null, 2));

  // ============================================================
  // FINAL OUTPUT
  // ============================================================

  console.log("");
  console.log("==========================================");
  console.log("       PAPERDEX DEPLOYMENT COMPLETE");
  console.log("==========================================");

  console.log("");
  console.log("USDTP:", usdtpAddress);

  console.log("BTCP:", btcpAddress);

  console.log("ETHP:", ethpAddress);

  console.log("SOLP:", solpAddress);

  console.log("Vault:", vaultAddress);

  console.log("PaperDEX:", dexAddress);

  console.log("");
  console.log("Deployment saved to:");

  console.log(deploymentFile);

  console.log("");
  console.log("==========================================");
}

// ============================================================
// RUN
// ============================================================

main()
  .then(() => {
    process.exitCode = 0;
  })
  .catch((error) => {
    console.error("");
    console.error("DEPLOYMENT FAILED");
    console.error("");
    console.error(error);

    process.exitCode = 1;
  });
