# Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, and a Hardhat Ignition module that deploys that contract.

Try running some of the following tasks:

```shell
npx hardhat help
npx hardhat test
REPORT_GAS=true npx hardhat test
npx hardhat node
npx hardhat ignition deploy ./ignition/modules/Lock.js
```

Hedera tokens can have three types of custom fees:

Fixed Fee: A set amount transferred to a fee collector account each time the token is transferred, payable in HBAR or another Hedera token (but not NFTs). Fixed Fees can apply to both fungible and non-fungible tokens.

Fractional Fee: A percentage of the transferred tokens, with optional minimum and maximum limits. The sender or receiver can be designated to pay this fee. Fractional Fees apply only to fungible tokens.

Royalty Fee: A fraction of the value exchanged for an NFT, or a fallback fixed fee if no value is exchanged. Royalty Fees are specific to non-fungible tokens (NFTs).

Each token can have up to 10 custom fees, and fee collectors can be exempted from paying these fees.
