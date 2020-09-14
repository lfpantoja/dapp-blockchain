const Publications = artifacts.require("Publications");

module.exports = function(deployer) {
  deployer.deploy(Publications,1000000000000000);
};