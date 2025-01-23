const { expect } = require("chai");
const { ethers } = require("hardhat");

// Constants
const { OPERATOR_ID, OPERATOR_KEY_DER, OPERATOR_KEY_HEX, ALICE_KEY_HEX, BOB_KEY_HEX, NETWORKS } = require("../constants");

// Hedera SDK and SDK utilities
const { Hbar, PrivateKey, HbarUnit } = require("@hashgraph/sdk");

// ABIs
// // For HBAR allowances via IHRC-632
// const IHRC632ABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-account-service/IHRC632.sol/IHRC632.json");
// const IHRC632ABI = new ethers.Interface(IHRC632ABI_JSON);
// // For HTS token allowances via ERC interfaces
// const ERC20MockABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/hip-583/ERC20Mock.sol/ERC20Mock.json");
// const ERC20MockABI = new ethers.Interface(ERC20MockABI_JSON);
// const ERC721MockABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/hip-583/ERC721Mock.sol/ERC721Mock.json");
// const ERC721MockABI = new ethers.Interface(ERC721MockABI_JSON);
// // For HTS token associations via IHRC-719
// const IHRC719ABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-token-service/IHRC719.sol/IHRC719.json");
// const IHRC719ABI = new ethers.Interface(IHRC719ABI_JSON);
// // For HTS atomic cryptoTransfer operation
// const IHederaTokenServiceABI_JSON = require("../hedera-smart-contracts/contracts-abi/contracts/system-contracts/hedera-token-service/IHederaTokenService.sol/IHederaTokenService.json");
// const IHederaTokenServiceABI = new ethers.Interface(IHederaTokenServiceABI_JSON);

describe("HTS token creation via contract interfaces", function () {
	// Set up the network and signers
	const network = NETWORKS.testnet.name;
	const treasurySigner = new ethers.Wallet(OPERATOR_KEY_HEX, ethers.provider);
	const aliceSigner = new ethers.Wallet(ALICE_KEY_HEX, ethers.provider);
	const bobSigner = new ethers.Wallet(BOB_KEY_HEX, ethers.provider);

	// Token setup
	let ftTokenId, ftTokenInfo, ftTokenAddress, nftTokenId, nftTokenInfo, nftTokenAddress;
	let callerAccountKeyValue, contractAddressKeyValue, ecdsaKeyValue, ecdsaPvKey, ecdsaPbKey, ed25519KeyValue, ed25519PvKey, ed25519PbKey;
	let fixedFee, fractionalFee;
	let tokenCreateCustomContract;
	let tokenCreateContractAddress, tokenCreateContract;

	// HTS system contract address and gas limit
	const htsSystemContractAddress = "0x0000000000000000000000000000000000000167";
	// const myContractAddress = "0x02abfe8f63f7b2a09bb11327533aa7b438f45edf"; // 0.0.4542295
	const payableHbarAmount = ethers.parseUnits("40", "ether");
	const gasLimit = 8000000; // Set your desired gas limit

	before(async function () {
		console.log(`- Checking accounts and setting up HTS tokens for test cases...\n`);

		// Log the account addresses
		console.log(`- Treasury address: ${treasurySigner.address}`);
		console.log(`- Alice address: ${aliceSigner.address}`);
		console.log(`- Bob address: ${bobSigner.address}`);

		// // Define KeyValue instances
		// callerAccountKeyValue = {
		// 	inheritAccountKey: true,
		// 	contractId: ethers.ZeroAddress,
		// 	ed25519: "0x",
		// 	ECDSA_secp256k1: "0x",
		// 	delegatableContractId: ethers.ZeroAddress,
		// };

		// contractAddressKeyValue = {
		// 	inheritAccountKey: false,
		// 	contractId: myContractAddress,
		// 	ed25519: "0x",
		// 	ECDSA_secp256k1: "0x",
		// 	delegatableContractId: ethers.ZeroAddress,
		// };

		// ecdsaPvKey = PrivateKey.generateECDSA();
		// ecdsaPbKey = ecdsaPvKey.publicKey.toStringRaw();
		// ecdsaPbKey = `0x${ecdsaPbKey}`;
		// console.log(`\n- ECDSA public key: ${ecdsaPbKey}`);
		// ecdsaKeyValue = {
		// 	inheritAccountKey: false,
		// 	contractId: ethers.ZeroAddress,
		// 	ed25519: "0x",
		// 	ECDSA_secp256k1: ecdsaPbKey,
		// 	delegatableContractId: ethers.ZeroAddress,
		// };

		// ed25519PvKey = PrivateKey.generateED25519();
		// ed25519PbKey = ed25519PvKey.publicKey.toStringRaw();
		// ed25519PbKey = `0x${ed25519PbKey}`;
		// console.log(`- ED25519 public key: ${ed25519PbKey}`);
		// ed25519KeyValue = {
		// 	inheritAccountKey: false,
		// 	contractId: ethers.ZeroAddress,
		// 	ed25519: ed25519PbKey,
		// 	ECDSA_secp256k1: "0x",
		// 	delegatableContractId: ethers.ZeroAddress,
		// };

		// // Fee schedules
		// fixedFee = [
		// 	{
		// 		amount: 100000000, // Amount of fee: 1 HBAR
		// 		tokenId: ethers.ZeroAddress, // Token ID of fee
		// 		useHbarsForPayment: true, // Use HBAR for payment
		// 		useCurrentTokenForPayment: false, // Use the token being transferred for payment
		// 		feeCollector: treasurySigner.address, // Address of fee collector
		// 	},
		// ];

		// fractionalFee = [
		// 	{
		// 		numerator: 5, // Numerator of fee
		// 		denominator: 100, // Denominator of fee
		// 		minimumAmount: 1, // Minimum amount of fee (in token units)
		// 		maximumAmount: 0, // Maximum amount of fee (0 implies no max)
		// 		netOfTransfers: true, // Net of transfers
		// 		feeCollector: treasurySigner.address, // Address of fee collector
		// 	},
		// ];

		// royaltyFee = [
		// 	{
		// 		numerator: 5, // Numerator of fee
		// 		denominator: 100, // Denominator of fee
		// 		// Fallback fee starts
		// 		amount: 100000000, // Amount of fallback fee: 1 HBAR
		// 		tokenId: ethers.ZeroAddress, // Token ID of fallback fee
		// 		useHbarsForPayment: true, // Use HBAR for fallback fee payment
		// 		// Fallback fee ends
		// 		feeCollector: treasurySigner.address, // Address of fee collector
		// 	},
		// ];

		// Deploy the CreateCustomHtsToken contract
		// const createCustomHtsTokenFactory = await ethers.getContractFactory("CreateCustomHtsToken");
		// tokenCreateContract = await createCustomHtsTokenFactory.deploy({ gasLimit: gasLimit });
		// tokenCreateContractAddress = await tokenCreateContract.getAddress();

		tokenCreateContractAddress = "0xFe3F587c88725870a3D30082b94533890C4F378D";
		tokenCreateContract = await ethers.getContractAt("CreateCustomHtsToken", tokenCreateContractAddress, treasurySigner);

		console.log("\n- Contract deployed at address:", tokenCreateContractAddress);
	});

	it("1. Should create a fungible HTS token via IHederaTokenService/HederaTokenService that has custom fixed & fractional fees and is managed by a contract (treasury & admin key)", async function () {
		// Define the parameters for the new token
		const treasuryAddress = tokenCreateContractAddress; // Use the contract's address as the treasury
		const fixedFeeTokenAddress = ethers.ZeroAddress; // Replace with a valid address for the token used to pay fees
		const tokenName = "MyCustomToken";
		const tokenSymbol = "MCT";
		const tokenMemo = "This is a custom fungible token";
		const initialSupply = 1000; // Initial total supply of the token
		const maxSupply = 10000; // Maximum supply of the token
		const decimals = 0; // Number of decimals for the token
		const feeAmount = 10; // Fee amount to be applied on transactions
		const keys = []; // Add any keys required for token operations (leave empty for now)

		// Execute the function to create a fungible token with custom fees
		const tx = await tokenCreateContract.createFungibleTokenWithCustomFeesPublic(
			treasuryAddress,
			fixedFeeTokenAddress,
			tokenName,
			tokenSymbol,
			tokenMemo,
			initialSupply,
			maxSupply,
			decimals,
			feeAmount,
			keys,
			{
				value: payableHbarAmount, // Amount of HBAR to send with the transaction
				gasLimit: gasLimit, // Gas limit for the transaction
			}
		);

		// Wait for the transaction to be mined
		const tokenCreateRx = await tx.wait();
		const txHash = tokenCreateRx.hash;
		console.log(`\n- Hash for token create transaction: \n${txHash}`);
		console.log(`- See: https://hashscan.io/${network}/transaction/${txHash}`);

		// Extract the event log for the token creation
		const event = tokenCreateRx.events.find(
			(e) => e.event === "CreatedToken" // Filter for the CreatedToken event
		);

		// Get the token address from the event log
		const tokenAddress = event.args.tokenAddress;

		// Validate that the token address exists and is a valid address
		// expect(tokenAddress).to.exist;
		// expect(tokenAddress).to.match(/^0x[a-fA-F0-9]{40}$/); // Ensure it's a valid Ethereum address
	});

	// it("2. Should create a non-fungible HTS token via IHederaTokenService/HederaTokenService that has custom fixed & royalty fees and is managed by a contract (treasury & admin key)", async function () {
	// 	// Define TokenKey instances
	// 	const adminKey = {
	// 		keyType: 1, // adminKey
	// 		key: callerAccountKeyValue, // This key must sign the transaction or be the caller
	// 	};
	// 	const kycKey = {
	// 		keyType: 2, // kycKey
	// 		key: ed25519KeyValue,
	// 	};
	// 	const freezeKey = {
	// 		keyType: 4, // freezeKey
	// 		key: ecdsaKeyValue,
	// 	};
	// 	const wipeKey = {
	// 		keyType: 8, // wipeKey
	// 		key: ecdsaKeyValue,
	// 	};
	// 	const supplyKey = {
	// 		keyType: 16, // supplyKey
	// 		key: callerAccountKeyValue,
	// 	};
	// 	const feeScheduleKey = {
	// 		keyType: 32, // feeScheduleKey
	// 		key: contractAddressKeyValue,
	// 	};
	// 	const pauseKey = {
	// 		keyType: 64, // pauseKey
	// 		key: contractAddressKeyValue,
	// 	};

	// 	const MyNonFungibleToken = {
	// 		name: "MyNonFungibleTokenWithKeysAndFees",
	// 		symbol: "MNFTWKAF",
	// 		treasury: treasurySigner.address, // The key for this address must sign the transaction or be the caller
	// 		memo: "This is a non-fungible token with keys and fees created via the HTS system contract",
	// 		tokenSupplyType: true, // true for finite, false for infinite
	// 		maxSupply: 100,
	// 		tokenKeys: [adminKey, kycKey, freezeKey, wipeKey, supplyKey, feeScheduleKey, pauseKey], // No keys. The token is immutable
	// 		freezeDefault: false, // true to freeze by default, false to not freeze by default
	// 		expiry: {
	// 			second: 0,
	// 			autoRenewAccount: treasurySigner.address,
	// 			autoRenewPeriod: 8000000,
	// 		},
	// 	};

	// 	// Define the payable amount (in wei)
	// 	const payableHbarAmount = ethers.parseUnits("40", "ether");

	// 	// Execute the token create
	// 	const treasuryIHederaTokenService = await ethers.getContractAt(IHederaTokenServiceABI, htsSystemContractAddress, treasurySigner);
	// 	const tokenCreateTx = await treasuryIHederaTokenService.createNonFungibleTokenWithCustomFees(MyNonFungibleToken, fixedFee, royaltyFee, {
	// 		value: payableHbarAmount, // Include the payable amount here
	// 		gasLimit: gasLimit,
	// 	});
	// 	const tokenCreateRx = await tokenCreateTx.wait();
	// 	const txHash = tokenCreateRx.hash;
	// 	console.log(`\n- Hash for token create transaction: \n${txHash}`);
	// 	console.log(`- See: https://hashscan.io/${network}/transaction/${txHash}`);
	// });
});
