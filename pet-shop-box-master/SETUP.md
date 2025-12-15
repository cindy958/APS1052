# APS1050 Petshop DApp — Setup / Run Guide (Windows)

This project is based on the **Truffle Pet Shop** seed DApp and includes 6 additional features (see `README.md`).

## Required Versions (record these in your executive summary / setup submission)

- **Node.js**: v24.12.0
- **npm**: 11.6.2
- **Truffle**: 5.11.5
- **Ganache**: 7.9.x (GUI or CLI)
- **Solidity compiler (solc-js used by Truffle)**: 0.5.17 (from `truffle compile` output)
- **Front-end dev server**: `lite-server` 2.3.0
- **Web3.js (Truffle)**: 1.10.0
- **Front-end framework**: none (Bootstrap + jQuery)

## 1) Install dependencies

From this directory:

```powershell
cd "...\pet-shop-box-master"
npm install
```

## 2) Start Ganache (GUI recommended)

Open **Ganache GUI** and Quickstart (or Workspace).

Recommended settings:
- **RPC host**: `127.0.0.1`
- **Port**: `7545`
- **Chain ID**: `1337`
- **Network ID**: `1337`

## 3) MetaMask configuration (Localhost 7545)

- Add / edit network **Localhost 7545**
  - **RPC URL**: `http://127.0.0.1:7545`
  - **Chain ID**: `1337`
- Import a Ganache account (copy **Private Key** from Ganache GUI → MetaMask → Import account)

## 4) Compile + Deploy contracts

If PowerShell blocks `npx` (ExecutionPolicy), run:

```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass -Force
```

Then deploy:

```powershell
& "$env:ProgramFiles\nodejs\npx.cmd" truffle compile --all
& "$env:ProgramFiles\nodejs\npx.cmd" truffle migrate --reset --network development
```

## 5) Run front-end

```powershell
npm run dev
```

Open:
- `http://localhost:3000`


