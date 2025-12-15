# Delivery Checklist (APS1050 Programming Project)

## Must-have deliverables (from `PersonalAndTeamProjects.txt`)

- Full DApp Truffle project directory (this folder)
- Setup instructions **with version numbers** (see `SETUP.md`)
- Video showing the DApp in operation
- Executive summary listing the **six major modifications** + why they matter
- Source attribution to the seed DApp (see `README.md`)

## “No surprises” sanity checks (do these right before recording video)

### Environment
- Ganache GUI running on `127.0.0.1:7545`
- MetaMask network set to Localhost 7545 (chainId=1337)
- MetaMask account imported from Ganache (has test ETH)

### Deploy + Run
- `truffle migrate --reset --network development` succeeds
- `npm run dev` runs and `http://localhost:3000` loads without console errors

### Feature proofs (what to show in video + what to capture in Ganache)

- **Feature 1 (Petshop donation)**:
  - Show donate form → confirm MetaMask tx
  - Show totals updated
  - Ganache **Events**: `PetshopDonation`
- **Feature 2 (Like)**:
  - Like a pet → likes count increases
  - Ganache **Events**: `PetLiked`
- **Feature 3 (Donate to pet)**:
  - Donate preset + custom → per-pet total updates
  - Ganache **Events**: `PetDonation`
- **Feature 4 (Buy)**:
  - Buy a pet → status becomes Sold and buttons disabled
  - Ganache **Events**: `PetBuy`
- **Feature 5 (Rating)**:
  - Submit rating → average & count updates
  - Ganache **Events**: `PetshopRated`
- **Feature 6 (Vaccination)**:
  - With owner account: add record → load records
  - With non-owner account: add record should fail (shows access control)
  - Ganache **Events**: `PetVaccination`

## Plagiarism / attribution notes (practical)

- The seed DApp is Truffle Pet Shop tutorial/box: **always cite it** in the executive summary and `README.md`.
- Avoid copying large blocks of explanation text from online sources; write your own description of:
  - how `web3` calls are used in `app.js` (promises/callbacks)
  - what on-chain state each feature stores and why


