require("hardhat-abi-exporter");
require("@openzeppelin/hardhat-upgrades");
require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-foundry");
require("@nomicfoundation/hardhat-chai-matchers");

const { OPERATOR_ID, OPERATOR_KEY_DER, OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX, NETWORKS } = require("./constants");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
	mocha: {
		timeout: 3600000,
		color: true,
		failZero: Boolean(process.env.CI),
		forbidOnly: Boolean(process.env.CI),
		// reporter: "mocha-multi-reporters",
		// reporterOption: {
		// 	reporterEnabled: "spec, mocha-junit-reporter",
		// 	mochaJunitReporterReporterOptions: {
		// 		mochaFile: "test-results.[hash].xml",
		// 		includePending: true,
		// 		outputs: true,
		// 	},
		// },
	},
	solidity: {
		version: "0.8.24",
		settings: {
			optimizer: {
				enabled: true,
				runs: 500,
			},
			evmVersion: "cancun",
		},
	},
	abiExporter: {
		path: "./hedera-smart-contracts/contracts-abi",
		runOnCompile: true,
	},
	defaultNetwork: NETWORKS.testnet.name,
	networks: {
		local: {
			url: NETWORKS.local.url,
			accounts: [OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX],
			chainId: NETWORKS.local.chainId,
			sdkClient: {
				operatorId: OPERATOR_ID,
				operatorKey: OPERATOR_KEY_DER,
				networkNodeUrl: NETWORKS.local.networkNodeUrl,
				nodeId: NETWORKS.local.nodeId,
				mirrorNode: NETWORKS.local.mirrorNode,
			},
		},
		testnet: {
			url: NETWORKS.testnet.url,
			accounts: [OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX],
			chainId: NETWORKS.testnet.chainId,
			sdkClient: {
				operatorId: OPERATOR_ID,
				operatorKey: OPERATOR_KEY_DER,
				networkNodeUrl: NETWORKS.testnet.networkNodeUrl,
				nodeId: NETWORKS.testnet.nodeId,
				mirrorNode: NETWORKS.testnet.mirrorNode,
			},
		},
		previewnet: {
			url: NETWORKS.previewnet.url,
			accounts: [OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX],
			chainId: NETWORKS.previewnet.chainId,
			sdkClient: {
				operatorId: OPERATOR_ID,
				operatorKey: OPERATOR_KEY_DER,
				networkNodeUrl: NETWORKS.previewnet.networkNodeUrl,
				nodeId: NETWORKS.previewnet.nodeId,
				mirrorNode: NETWORKS.previewnet.mirrorNode,
			},
		},
	},
};
