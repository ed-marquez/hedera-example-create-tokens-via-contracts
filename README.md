# Create HTS Tokens Via Smart Contracts

This repository demonstrates how to create Hedera Token Service (HTS) tokens via smart contracts.

## Try It on the Browser:

[![Open in Gitpod](https://gitpod.io/button/open-in-gitpod.svg)](https://gitpod.io/?autostart=true#https://github.com/ed-marquez/hedera-example-create-tokens-via-contracts)

## Try It Locally:

### Prerequisites

- Node.js
- npm
- A Hedera account with ECDSA credentials

### Instructions

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ed-marquez/hedera-example-create-tokens-via-contracts.git
   cd hedera-example-create-tokens-via-contracts
   ```
2. **Rename the `example.env` file to `.env` and enter the ECDSA credentials for the 3 accounts needed**:
   ```bash
   mv example.env .env
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the test script:**:
   ```bash
   npx hardhat test
   ```

## Project Structure

- `.env`: Environment variables file (be sure to rename `example.env` to `.env` and fill in your credentials).
- `constants.js`: Contains constants and network configurations.
- `hardhat.config.js`: Hardhat configuration file.
- `createAccountManagedTokens.test.js`: Contains the test script for creating the account-managed HTS tokens via the Hedera System Contracts.

## Flow Description

1. **Initialize Environment Variables**:
   - Rename `example.env` to `.env` and fill in your ECDSA account credentials.
2. **Use Environment Variables**:
   - The credentials from `.env` are used in `constants.js`.
3. **Configure Hardhat**:
   - The constants from `constants.js` are used in `hardhat.config.js` for network and account configuration.
4. **Run Tests**:
   - Tests in `createAccountManagedTokens.test.js` create fungible tokens (FT) and non-fungible tokens (NFT).
