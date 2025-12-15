# Pet Shop Truffle Box

This box has all you need to get started with our [Pet Shop tutorial](http://truffleframework.com/tutorials/pet-shop).

## Attribution (Important)

This project is **based on the Truffle Pet Shop tutorial / Truffle Box seed DApp**. We extended the seed by adding **six major features** (each involving smart contract + front-end changes) for the APS1050 programming project requirement.

## Our 6 Major Features (APS1050)

1. **Donate to Petshop** (contract: `donate()` + stats + `PetshopDonation`; front-end: donation form + live totals)
2. **Pet Like (Voting)** (contract: `likePet()`/`getLikes()` + `PetLiked`; front-end: Like button + likes display)
3. **Donate to a Specific Pet** (contract: preset/custom donate + totals + `PetDonation`; front-end: per-pet donate UI + totals)
4. **Buy a Pet** (contract: `buyPet()` + sold checks + `PetBuy`; front-end: Buy button + status updates)
5. **Petshop Rating (1–5 Stars)** (contract: `ratePetshop()` + average/count + `PetshopRated`; front-end: rating panel + live stats)
6. **Vaccination Records** (contract: owner-only `addVaccination()` + getters + `PetVaccination`; front-end: add/view vaccination UI)

## Installation

See `SETUP.md` for **full setup steps + required version numbers** (Node/Truffle/Ganache/Solidity/web3/lite-server) and Windows PowerShell notes.

## Quick Start (after setup)

From this folder:

1. Start Ganache GUI (RPC **`127.0.0.1:7545`**, **chainId=1337**, **networkId=1337**)
2. Deploy contracts:

```bash
npx truffle migrate --reset --network development
```

3. Run the front-end:

```bash
npm run dev
```

Then open **`http://localhost:3000`**.


