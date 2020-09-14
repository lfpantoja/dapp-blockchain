# Dapp Blockchain

This project is a Decentralized Application (dApp) running on the Ethereum Blockchain.

This project allows:
- Use InterPlanetary File System (IPFS ) to save arbitrary text.
- Save text paper from web browser.

Has a cost in gas (Ether) by the contract: 0.001 ETH

## Tools

- Truffle 5.1.43
- Solidity 0.5.16
- React js 16.13.1
-	Ganache 2.4.0
-	NodeJS 10.22.0
-	Metamask for Firefox 8.0.9
- IPFS 0.6.0

## Running locally

### Install Dependencies

1.	Install NodeJS

`curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -`

`sudo apt-get install -y nodejs`

Also install

`apt-get install -y build-essential`

NodeSource's NodeJS package contains the Node and NPM binary, so you don't need to install NPM separately.

2.	Download and execute Ganache GUI from ([Official Web](https://github.com/trufflesuite/ganache/releases)), make sure to download the lastest version of Ganache AppImage.

	(For this project it was downloaded **ganache-2.4.0-linux-x86_64.AppImage**)

3.	Install Truffle Framework with

`npm install -g truffle`

4. Install Metamask extension for Firefox browser ([Firefox ADD-ONS](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask))

5.	Install IPFS

`npm install ipfs`

### Project Development

1.	Create a directory for the project and go to the directory

`mkdir dapp-blockchain`

`cd dapp-blockchain`

2.	For a default set of contracts and tests

`truffle init`

3.	Configure truffle-config.js to connect to ganache.

4.	Codify the contract. (See dapp-blockchain/contracts/Publications.sol)

5.	Create directory client for de client-side and inside of the client directory, create a package.json this helps to install dependencies for the client-side, testting smart contracts and more. (See dapp-blockchain/client/package.json)

6.	Codify de client side with React. (See /dapp-blockchain/client)

7.	After of codify de client side of this app go to the	dapp-blockchain folder (root folder)	and execute

`truffle compile`

`truffle migrate --network development`

8.	Next, enter in the client folder, and execute

`npm install`

`npm run start`

9.	In the browser, select the ganache url in Metamask Extension and finally go to `http://localhost:3000/`




















