require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.28",

    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },

      viaIR: true,

      evmVersion: "cancun",
    },
  },

  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,

      accounts: [process.env.DEPLOYER_PRIVATE_KEY],

      chainId: 11155111,
    },
  },
};
