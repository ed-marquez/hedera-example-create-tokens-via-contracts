const { expect } = require("chai");
const { ethers } = require("hardhat");

// Constants
const { OPERATOR_ID, OPERATOR_KEY_DER, OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX, NETWORKS } = require("../constants");

// Hedera SDK and SDK utilities
const { Hbar, PrivateKey, HbarUnit } = require("@hashgraph/sdk");

// ABIs
// For HBAR allowances via IHRC-632
const IHRC632ABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-account-service/IHRC632.sol/IHRC632.json");
const IHRC632ABI = new ethers.Interface(IHRC632ABI_JSON);
// For HTS token allowances via ERC interfaces
const ERC20MockABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/hip-583/ERC20Mock.sol/ERC20Mock.json");
const ERC20MockABI = new ethers.Interface(ERC20MockABI_JSON);
const ERC721MockABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/hip-583/ERC721Mock.sol/ERC721Mock.json");
const ERC721MockABI = new ethers.Interface(ERC721MockABI_JSON);
// For HTS token associations via IHRC-719
const IHRC719ABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-token-service/IHRC719.sol/IHRC719.json");
const IHRC719ABI = new ethers.Interface(IHRC719ABI_JSON);
// For HTS atomic cryptoTransfer operation
const IHederaTokenServiceABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol/IHederaTokenService.json");
const IHederaTokenServiceABI = new ethers.Interface(IHederaTokenServiceABI_JSON);

describe("HTS token creation via contract interfaces", function () {
	// Set up the network and signers
	const network = NETWORKS.testnet.name;
	const treasurySigner = new ethers.Wallet(OPERATOR_KEY_HEX, ethers.provider);
	const aliceSigner = new ethers.Wallet(ALICE_KEY_HEX, ethers.provider);
	const bobSigner = new ethers.Wallet(BOB_KEY_HEX, ethers.provider);

	// Token setup
	let ftTokenId, ftTokenInfo, ftTokenAddress, nftTokenId, nftTokenInfo, nftTokenAddress;
	let callerAccountKeyValue, contractAddressKeyValue, ecdsaKeyValue, ecdsaPvKey, ecdsaPbKey, ed25519KeyValue, ed25519PvKey, ed25519PbKey;

	// HTS system contract address and gas limit
	const htsSystemContractAddress = "0x0000000000000000000000000000000000000167";
	const myContractAddress = "0x02abfe8f63f7b2a09bb11327533aa7b438f45edf"; // 0.0.4542295
	const gasLimit = 8000000; // Set your desired gas limit

	// Amounts and serial numbers to approve and spend
	const hbarAmount = new Hbar(1); // Amount of HBAR to approve and transfer
	const ftAmount = BigInt(10); // Amount of fungible tokens to approve and transfer
	const nftSerialToSpend = BigInt(5); // Serial # of NFT to approve and transfer

	before(async function () {
		console.log(`- Checking accounts and setting up HTS tokens for test cases...\n`);

		// Log the account addresses
		console.log(`- Treasury address: ${treasurySigner.address}`);
		console.log(`- Alice address: ${aliceSigner.address}`);
		console.log(`- Bob address: ${bobSigner.address}`);

		// Define KeyValue instances
		callerAccountKeyValue = {
			inheritAccountKey: true,
			contractId: "0x0000000000000000000000000000000000000000",
			ed25519: "0x",
			ECDSA_secp256k1: "0x",
			delegatableContractId: "0x0000000000000000000000000000000000000000",
		};

		contractAddressKeyValue = {
			inheritAccountKey: false,
			contractId: myContractAddress,
			ed25519: "0x",
			ECDSA_secp256k1: "0x",
			delegatableContractId: "0x0000000000000000000000000000000000000000",
		};

		ecdsaPvKey = PrivateKey.generateECDSA();
		ecdsaPbKey = ecdsaPvKey.publicKey.toStringRaw();
		ecdsaPbKey = `0x${ecdsaPbKey}`;
		console.log(`\n- ECDSA public key: ${ecdsaPbKey}`);
		ecdsaKeyValue = {
			inheritAccountKey: false,
			contractId: "0x0000000000000000000000000000000000000000",
			ed25519: "0x",
			ECDSA_secp256k1: ecdsaPbKey,
			delegatableContractId: "0x0000000000000000000000000000000000000000",
		};

		ed25519PvKey = PrivateKey.generateED25519();
		ed25519PbKey = ed25519PvKey.publicKey.toStringRaw();
		ed25519PbKey = `0x${ed25519PbKey}`;
		console.log(`- ED25519 public key: ${ed25519PbKey}`);
		ed25519KeyValue = {
			inheritAccountKey: false,
			contractId: "0x0000000000000000000000000000000000000000",
			ed25519: ed25519PbKey,
			ECDSA_secp256k1: "0x",
			delegatableContractId: "0x0000000000000000000000000000000000000000",
		};
	});

	it("1. Should create a fungible HTS token with ECDSA & ED25519 keys via a contract", async function () {
		// Define TokenKey instances
		const adminKey = {
			keyType: 1, // adminKey
			key: callerAccountKeyValue,
		};
		const kycKey = {
			keyType: 2, // kycKey
			key: callerAccountKeyValue,
		};
		const freezeKey = {
			keyType: 4, // freezeKey
			key: callerAccountKeyValue,
		};
		const wipeKey = {
			keyType: 8, // wipeKey
			key: callerAccountKeyValue,
		};
		const supplyKey = {
			keyType: 16, // supplyKey
			key: callerAccountKeyValue,
		};
		const feeScheduleKey = {
			keyType: 32, // feeScheduleKey
			key: callerAccountKeyValue,
		};
		const pauseKey = {
			keyType: 64, // pauseKey
			key: callerAccountKeyValue,
		};

		const myToken = {
			name: "MyToken",
			symbol: "MTK",
			treasury: treasurySigner.address,
			memo: "memo",
			tokenSupplyType: true,
			maxSupply: 10,
			freezeDefault: false,
			tokenKeys: [adminKey, kycKey, freezeKey, wipeKey, supplyKey, feeScheduleKey, pauseKey],
			expiry: {
				second: 0,
				autoRenewAccount: treasurySigner.address,
				autoRenewPeriod: 8000000,
			},
		};
		const initialTotalSupply = 10;
		const decimals = 0;

		// Define the payable amount (in wei)
		const payableHbarAmount = ethers.parseUnits("40", "ether");

		// Execute the token create
		const treasuryIHederaTokenService = await ethers.getContractAt(IHederaTokenServiceABI, htsSystemContractAddress, treasurySigner);
		const tokenCreateTx = await treasuryIHederaTokenService.createFungibleToken(myToken, initialTotalSupply, decimals, {
			value: payableHbarAmount, // Include the payable amount here
			gasLimit: gasLimit,
		});
		const tokenCreateRx = await tokenCreateTx.wait();
		const txHash = tokenCreateRx.hash;
		console.log(`\n- Hash for token create transaction: \n${txHash}`);
	});

	it("2. Should create a fungible HTS token with contract keys via a contract", async function () {
		// Define TokenKey instances
		const adminKey = {
			keyType: 1, // adminKey
			key: callerAccountKeyValue,
		};
		const kycKey = {
			keyType: 2, // kycKey
			key: contractAddressKeyValue,
		};
		const freezeKey = {
			keyType: 4, // freezeKey
			key: contractAddressKeyValue,
		};
		const wipeKey = {
			keyType: 8, // wipeKey
			key: contractAddressKeyValue,
		};
		const supplyKey = {
			keyType: 16, // supplyKey
			key: contractAddressKeyValue,
		};
		const feeScheduleKey = {
			keyType: 32, // feeScheduleKey
			key: contractAddressKeyValue,
		};
		const pauseKey = {
			keyType: 64, // pauseKey
			key: contractAddressKeyValue,
		};

		const myToken = {
			name: "MyToken2",
			symbol: "MTK2",
			treasury: treasurySigner.address,
			memo: "memo",
			tokenSupplyType: true,
			maxSupply: 10,
			freezeDefault: false,
			tokenKeys: [adminKey, kycKey, freezeKey, wipeKey, supplyKey, feeScheduleKey, pauseKey],
			expiry: {
				second: 0,
				autoRenewAccount: treasurySigner.address,
				autoRenewPeriod: 8000000,
			},
		};
		const initialTotalSupply = 10;
		const decimals = 0;

		// Define the payable amount (in wei)
		const payableHbarAmount = ethers.parseUnits("40", "ether");

		// Execute the token create
		const treasuryIHederaTokenService = await ethers.getContractAt(IHederaTokenServiceABI, htsSystemContractAddress, treasurySigner);
		const tokenCreateTx = await treasuryIHederaTokenService.createFungibleToken(myToken, initialTotalSupply, decimals, {
			value: payableHbarAmount, // Include the payable amount here
			gasLimit: gasLimit,
		});
		// const atomicTransferTx = await treasuryIHederaTokenService.createFungibleTokenWithCustomFees();
		// const atomicTransferTx = await treasuryIHederaTokenService.createNonFungibleToken(cryptoTransfers, tokenTransferList);
		// const atomicTransferTx = await treasuryIHederaTokenService.createNonFungibleTokenWithCustomFees(cryptoTransfers, tokenTransferList);
		const tokenCreateRx = await tokenCreateTx.wait();
		const txHash = tokenCreateRx.hash;
		console.log(`\n- Hash for token create transaction: \n${txHash}`);
	});

	it("3. Should create a fungible HTS token with ECDSA keys and custom fees via a contract", async function () {
		// Define TokenKey instances
		const adminKey = {
			keyType: 1, // adminKey
			key: callerAccountKeyValue,
		};
		const kycKey = {
			keyType: 2, // kycKey
			key: callerAccountKeyValue,
		};
		const freezeKey = {
			keyType: 4, // freezeKey
			key: callerAccountKeyValue,
		};
		const wipeKey = {
			keyType: 8, // wipeKey
			key: callerAccountKeyValue,
		};
		const supplyKey = {
			keyType: 16, // supplyKey
			key: callerAccountKeyValue,
		};
		const feeScheduleKey = {
			keyType: 32, // feeScheduleKey
			key: callerAccountKeyValue,
		};
		const pauseKey = {
			keyType: 64, // pauseKey
			key: callerAccountKeyValue,
		};

		const myToken = {
			name: "MyToken3",
			symbol: "MTK3",
			treasury: treasurySigner.address,
			memo: "memo",
			tokenSupplyType: true,
			maxSupply: 10,
			freezeDefault: false,
			tokenKeys: [adminKey, kycKey, freezeKey, wipeKey, supplyKey, feeScheduleKey, pauseKey],
			expiry: {
				second: 0,
				autoRenewAccount: treasurySigner.address,
				autoRenewPeriod: 8000000,
			},
		};
		const initialTotalSupply = 10;
		const decimals = 0;

		// Define the fixed fee
		const fixedFee = [
			{
				amount: 100000000, // Amount of fee - 1 HBAR
				tokenId: ethers.ZeroAddress, // Token ID of fee
				useHbarsForPayment: true, // Denomination of fee
				useCurrentTokenForPayment: false, // Denomination of fee
				feeCollector: treasurySigner.address, // Address of fee collector
			},
		];

		// Define the fractional fee
		const fractionalFee = [
			{
				numerator: 5, // Numerator of fee
				denominator: 100, // Denominator of fee
				minimumAmount: 1, // Minimum amount of fee
				maximumAmount: 0, // Maximum amount of fee (0 implies no max)
				netOfTransfers: true, // Net of transfers
				feeCollector: treasurySigner.address, // Address of fee collector
			},
		];

		// Define the payable amount (in wei)
		const payableHbarAmount = ethers.parseUnits("40", "ether");

		// Execute the token create
		const treasuryIHederaTokenService = await ethers.getContractAt(IHederaTokenServiceABI, htsSystemContractAddress, treasurySigner);
		const tokenCreateTx = await treasuryIHederaTokenService.createFungibleTokenWithCustomFees(
			myToken,
			initialTotalSupply,
			decimals,
			fixedFee,
			fractionalFee,
			{
				value: payableHbarAmount, // Include the payable amount here
				gasLimit: gasLimit,
			}
		);
		// const atomicTransferTx = await treasuryIHederaTokenService.createNonFungibleToken(cryptoTransfers, tokenTransferList);
		// const atomicTransferTx = await treasuryIHederaTokenService.createNonFungibleTokenWithCustomFees(cryptoTransfers, tokenTransferList);
		const tokenCreateRx = await tokenCreateTx.wait();
		const txHash = tokenCreateRx.hash;
		console.log(`\n- Hash for token create transaction: \n${txHash}`);
	});
});
