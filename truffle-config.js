const path = require("path");
var HDWalletProvider = require("truffle-hdwallet-provider");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    development: {
      //host: "127.0.0.1",
      host: "127.0.0.1",
      port: 7545,
      network_id: "5777",
      gas: 6721975
    }
  }
};