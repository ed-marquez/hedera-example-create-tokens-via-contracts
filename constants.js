require("dotenv").config();
const { ethers } = require("ethers");

/**  @type string */
const OPERATOR_ID = process.env.OPERATOR_ID ? process.env.OPERATOR_ID : "0.0.0";

/**  @type string */
const OPERATOR_KEY_DER = process.env.OPERATOR_KEY_DER ? process.env.OPERATOR_KEY_DER : ethers.ZeroHash;
const OPERATOR_KEY_HEX = process.env.OPERATOR_KEY_HEX ? process.env.OPERATOR_KEY_HEX : ethers.ZeroHash;

const ALICE_KEY_HEX = process.env.ALICE_KEY_HEX ? process.env.ALICE_KEY_HEX : ethers.ZeroHash;

const BOB_KEY_HEX = process.env.BOB_KEY_HEX ? process.env.BOB_KEY_HEX : ethers.ZeroHash;

const NETWORKS = {
	local: {
		name: "local",
		url: "http://localhost:7546",
		chainId: 298,
		networkNodeUrl: "127.0.0.1:50211",
		nodeId: "3",
		mirrorNode: "http://127.0.0.1:5600",
	},
	testnet: {
		name: "testnet",
		url: "https://296.rpc.thirdweb.com",
		// url: "https://testnet.hashio.io/api",
		chainId: 296,
		networkNodeUrl: "0.testnet.hedera.com:50211", // https://docs.hedera.com/hedera/networks/testnet/testnet-nodes
		nodeId: "3",
		mirrorNode: "testnet.mirrornode.hedera.com:443", // https://docs.hedera.com/hedera/core-concepts/mirror-nodes/hedera-mirror-node#testnet
	},
	previewnet: {
		name: "previewnet",
		url: "https://previewnet.hashio.io/api",
		chainId: 297,
		networkNodeUrl: "0.previewnet.hedera.com:50211", // https://docs.hedera.com/hedera/networks/testnet/testnet-nodes#preview-testnet-nodes
		nodeId: "3",
		mirrorNode: "previewnet.mirrornode.hedera.com:443", // https://docs.hedera.com/hedera/core-concepts/mirror-nodes/hedera-mirror-node#previewnet
	},
	besu: {
		name: "besu_local",
		url: "http://127.0.0.1:8544",
		chainId: 1337,
		allowUnlimitedContractSize: true,
		blockGasLimit: 0x1fffffffffffff,
		gas: 1_000_000_000,
		timeout: 60_000,
	},
};

module.exports = {
	OPERATOR_ID,
	OPERATOR_KEY_DER,
	OPERATOR_KEY_HEX,
	ALICE_KEY_HEX,
	BOB_KEY_HEX,
	NETWORKS,
};
