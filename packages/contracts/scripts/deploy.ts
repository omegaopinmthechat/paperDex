import { ethers } from "hardhat";
import "dotenv/config";

async function main() {
  // ============================================================
  // CONFIGURATION
  // ============================================================

  const [admin] = await ethers.getSigners();

  const relayerAddress = process.env.RELAYER_ADDRESS as string;
  const quoteSignerAddress = process.env.QUOTE_SIGNER_ADDRESS as string;

  if (!relayerAddress) {
    throw new Error("RELAYER_ADDRESS missing from .env");
  }

  if (!quoteSignerAddress) {
    throw new Error("QUOTE_SIGNER_ADDRESS missing from .env");
  }

  if (!ethers.isAddress(relayerAddress)) {
    throw new Error("RELAYER_ADDRESS is invalid");
  }

  if (!ethers.isAddress(quoteSignerAddress)) {
    throw new Error("QUOTE_SIGNER_ADDRESS is invalid");
  }

  const network = await ethers.provider.getNetwork();

  // Prevent accidentally deploying this script somewhere else.
  if (network.chainId !== 11155111n) {
    throw new Error(
      `Expected Sepolia (11155111), got chain ID ${network.chainId}`
    );
  }

  console.log("==========================================");
  console.log("        PaperDEX Sepolia Deployment");
  console.log("==========================================");
  console.log("Chain ID:", network.chainId.toString());
  console.log("Admin:", admin.address);
  console.log("Relayer:", relayerAddress.replace(/[\r\n]/g, ""));
  console.log("Quote signer:", quoteSignerAddress.replace(/[\r\n]/g, ""));

  const adminBalance = await ethers.provider.getBalance(admin.address);

  console.log(
    "Admin Sepolia ETH:",
    ethers.formatEther(adminBalance)
  );

  if (adminBalance === 0n) {
    throw new Error("Admin has no Sepolia ETH");
  }

  // ============================================================
  // 1. USDTP
  // ============================================================

  console.log("\nDeploying USDTP...");

  const PaperUSD =
    await ethers.getContractFactory("PaperUSD");

  const usdtp =
    await PaperUSD.deploy(admin.address);

  await usdtp.waitForDeployment();

  const usdtpAddress =
    await usdtp.getAddress();

  console.log("USDTP:", usdtpAddress);

  // ============================================================
  // 2. PAPER TOKENS
  // ============================================================

  const PaperToken =
    await ethers.getContractFactory("PaperToken");

  console.log("\nDeploying BTCP...");

  const btcp = await PaperToken.deploy(
    "Bitcoin Paper",
    "BTCP",
    admin.address
  );

  await btcp.waitForDeployment();

  const btcpAddress =
    await btcp.getAddress();

  console.log("BTCP:", btcpAddress);


  console.log("\nDeploying ETHP...");

  const ethp = await PaperToken.deploy(
    "Ethereum Paper",
    "ETHP",
    admin.address
  );

  await ethp.waitForDeployment();

  const ethpAddress =
    await ethp.getAddress();

  console.log("ETHP:", ethpAddress);


  console.log("\nDeploying SOLP...");

  const solp = await PaperToken.deploy(
    "Solana Paper",
    "SOLP",
    admin.address
  );

  await solp.waitForDeployment();

  const solpAddress =
    await solp.getAddress();

  console.log("SOLP:", solpAddress);

  // ============================================================
  // 3. VAULT
  // ============================================================

  console.log("\nDeploying Vault...");

  const PaperDEXVault =
    await ethers.getContractFactory("PaperDEXVault");

  const vault =
    await PaperDEXVault.deploy(admin.address);

  await vault.waitForDeployment();

  const vaultAddress =
    await vault.getAddress();

  console.log("Vault:", vaultAddress);

  // ============================================================
  // 4. PAPERDEX
  // ============================================================

  console.log("\nDeploying PaperDEX...");

  const PaperDEX =
    await ethers.getContractFactory("PaperDEX");

  const dex = await PaperDEX.deploy(
    usdtpAddress,
    vaultAddress,
    admin.address,
    relayerAddress,
    quoteSignerAddress
  );

  await dex.waitForDeployment();

  const dexAddress =
    await dex.getAddress();

  console.log("PaperDEX:", dexAddress);

  // ============================================================
  // 5. EXCHANGE ROLES
  // ============================================================

  console.log("\nGranting exchange roles...");

  let tx = await btcp.grantRole(
    await btcp.EXCHANGE_ROLE(),
    dexAddress
  );

  await tx.wait();

  tx = await ethp.grantRole(
    await ethp.EXCHANGE_ROLE(),
    dexAddress
  );

  await tx.wait();

  tx = await solp.grantRole(
    await solp.EXCHANGE_ROLE(),
    dexAddress
  );

  await tx.wait();

  tx = await usdtp.grantRole(
    await usdtp.EXCHANGE_ROLE(),
    dexAddress
  );

  await tx.wait();

  console.log("PaperDEX has token exchange roles.");

  // ============================================================
  // 6. VAULT ROLE
  // ============================================================

  tx = await vault.grantRole(
    await vault.EXCHANGE_ROLE(),
    dexAddress
  );

  await tx.wait();

  console.log("PaperDEX has Vault EXCHANGE_ROLE.");

  // ============================================================
  // 7. ONBOARDING ROLE
  // ============================================================

  tx = await usdtp.grantRole(
    await usdtp.ONBOARDING_ROLE(),
    relayerAddress
  );

  await tx.wait();

  console.log("Relayer has ONBOARDING_ROLE.");

  // ============================================================
  // 8. SUPPORTED TOKENS
  // ============================================================

  console.log("\nRegistering markets...");

  tx = await dex.addSupportedToken(btcpAddress);
  await tx.wait();

  tx = await dex.addSupportedToken(ethpAddress);
  await tx.wait();

  tx = await dex.addSupportedToken(solpAddress);
  await tx.wait();

  console.log("BTCP registered.");
  console.log("ETHP registered.");
  console.log("SOLP registered.");

  // ============================================================
  // 9. FUND VAULT
  // ============================================================

  console.log("\nFunding Vault...");

  tx = await usdtp.mint(
    vaultAddress,
    ethers.parseEther("1000000000")
  );

  await tx.wait();

  console.log("USDTP funded.");

  tx = await btcp.mint(
    vaultAddress,
    ethers.parseEther("10000")
  );

  await tx.wait();

  console.log("BTCP funded.");

  tx = await ethp.mint(
    vaultAddress,
    ethers.parseEther("100000")
  );

  await tx.wait();

  console.log("ETHP funded.");

  tx = await solp.mint(
    vaultAddress,
    ethers.parseEther("5000000")
  );

  await tx.wait();

  console.log("SOLP funded.");

  // ============================================================
  // 10. VERIFY VAULT BALANCES
  // ============================================================

  console.log("\n==========================================");
  console.log("              VAULT");
  console.log("==========================================");

  console.log(
    "USDTP:",
    ethers.formatEther(
      await usdtp.balanceOf(vaultAddress)
    )
  );

  console.log(
    "BTCP:",
    ethers.formatEther(
      await btcp.balanceOf(vaultAddress)
    )
  );

  console.log(
    "ETHP:",
    ethers.formatEther(
      await ethp.balanceOf(vaultAddress)
    )
  );

  console.log(
    "SOLP:",
    ethers.formatEther(
      await solp.balanceOf(vaultAddress)
    )
  );

  // ============================================================
  // FINAL
  // ============================================================

  console.log("\n==========================================");
  console.log("     SEPOLIA DEPLOYMENT COMPLETE");
  console.log("==========================================");

  console.log(`
{
  "chainId": 11155111,
  "USDTP": "${usdtpAddress}",
  "BTCP": "${btcpAddress}",
  "ETHP": "${ethpAddress}",
  "SOLP": "${solpAddress}",
  "vault": "${vaultAddress}",
  "paperDEX": "${dexAddress}",
  "admin": "${admin.address}",
  "relayer": "${relayerAddress.replace(/[\r\n]/g, "")}",
  "quoteSigner": "${quoteSignerAddress.replace(/[\r\n]/g, "")}"
}
  `);
}

main().catch((error) => {
  console.error("Deployment failed:");
  console.error(error);

  process.exitCode = 1;
});