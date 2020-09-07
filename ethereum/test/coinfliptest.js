const CoinFlip = artifacts.require("CoinFlip");
const truffleAssert = require("truffle-assertions");

contract("CoinFlip", async function(accounts){

	let instance
	let balance

	before(async function(){
		instance = await CoinFlip.deployed();
	});

	beforeEach(async function(){
		balance = parseFloat(await instance.contractBalance());
	});

	it("has initial balance", async function(){
		assert(balance > 0, "Expected to have more than zero balance");
	});

	it("shouldn't flip without minimum bid", async function(){
		await truffleAssert.fails(instance.flip({value: 0}), truffleAssert.ErrorType.REVERT);
	});

	it("should flip when bid is valid", async function(){
		await truffleAssert.passes(instance.flip({value: web3.utils.toWei("1", "szabo")}));
	});

	it("should payout when flip is won", async function(){
		await instance.freeze_time(1001);
// gasPrice
		let result = await instance.flip({from: accounts[1], value: web3.utils.toWei("1", "szabo"), gasPrice: web3.utils.toWei("1", "wei")});

		let newBalance = parseFloat(await instance.contractBalance());

		truffleAssert.eventEmitted(result, 'flipResult', (ev) => {
		    return ev.result == true;
		});

		assert(newBalance < balance, "Expected contract to have increased in balance");
	});

	it("shouldn't payout when flip is lost", async function(){
		await instance.freeze_time(1000);

		let result = await instance.flip({from: accounts[1], value: web3.utils.toWei("1", "szabo"), gasPrice: web3.utils.toWei("1", "wei")});

		let newBalance = parseFloat(await instance.contractBalance());

		truffleAssert.eventEmitted(result, 'flipResult', (ev) => {
		    return ev.result == false;
		});

		assert(newBalance > balance, "Expected contract to have reduced in balance");
	});
});
