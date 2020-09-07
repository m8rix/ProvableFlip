const CoinFlip = artifacts.require("CoinFlip");

module.exports = function(deployer, network, accounts) {
	deployer.deploy(CoinFlip).then(function(instance) {
		if (network == "ganache") {
			for (var i = 0; i < accounts.length - 1; i++) {
				instance.stake({value: web3.utils.toWei("20", "ether"), from: accounts[i]});
			}
		}
	});
};
