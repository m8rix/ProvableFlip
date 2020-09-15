var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var contractOwner;

$(document).ready(function(){
	$.getJSON('./ethereum/build/contracts/CoinFlip.json', function(coinFlipBuild){
		window.ethereum.enable().then(function(accounts){

			web3.eth.net.getId().then(netId => {
				setContract(coinFlipBuild, netId, accounts[0]);
			}).then(function(){

				contractInstance.events.flipResult({filter: {address: accounts[0]}}, async function(error, event){
					flipResult(error, event);
				});

				contractInstance.events.proveRandomness(async function(error, event){
					console.log(event.returnValues);
				});

				setOwner(accounts[0]);
			});

			setAccount(accounts[0]);

	 		window.ethereum.on('accountsChanged', function() {
	 			setAccount(window.ethereum.selectedAddress);
	 			setOwner(window.ethereum.selectedAddress);
	 		});
		});
		$("#gamble_button").click(coinFlip);
		$("#stake_button").click(donateFunds);
		$("#destroy_button").click(destroyContract);
	});
});

function setContract(build, netId, account){
	this.contractInstance = new web3.eth.Contract(
		build.abi,
		build.networks[netId].address,
		{from: account}
	)
}

function setOwner(account){
	this.contractInstance.methods.owner().call().then(contractOwner => {
		if (account.toLowerCase() == contractOwner.toLowerCase()) {
			$("#destroy_button").show();
		} else {
			$("#destroy_button").hide();
		}
	});
}

function setAccount(account){
	setWalletBalance(account);
	setDefaults(account);
}

function coinFlip(){
	coinState("spin");
	var amount = document.getElementById("rangeValue").innerHTML;
	contractInstance.methods.flip().send(
		{
			value: web3.utils.toWei(amount, "ether")
		}
	);
}

function donateFunds(){
	var amount = document.getElementById("rangeValue").innerHTML;
	contractInstance.methods.stake().send(
		{
			value: web3.utils.toWei(amount, "ether")
		}
	);
}

function destroyContract(){
	contractInstance.methods.destroyContract().send();
}

function flipResult(error, event){
	if(!error){
		event.returnValues.result ? coinState("green") : coinState("red");
	} else {
		coinState("red");
		console.log(error);
	}
	setWalletBalance($("#wallet_address").val());
}

function toggleButtonFunction() {
	if (document.getElementById("rangeValue").innerHTML != "0.00"){
		$("#gamble_button").removeAttr('disabled');
		$("#stake_button").removeAttr('disabled');
	} else {
		$("#gamble_button").attr("disabled", true);
		$("#stake_button").attr("disabled", true);
	}
}

function rangeSlider(value){
	toggleButtonFunction();
	var balance = parseFloat(web3.utils.fromWei($("#wallet_balance").val(), "ether"));
	var toWei = parseFloat(value) / 100;
	document.getElementById("rangeValue").innerHTML = (balance * toWei).toFixed(2);
}

function setWalletBalance(address){
	web3.eth.getBalance(address).then(function(balance){
		$("#wallet_balance").val(balance);
	});
}

function setDefaults(address){
	$("#range_slider").val(0);
	$("#wallet_address").val(address)
	document.getElementById("rangeValue").innerHTML = "0.00"
	toggleButtonFunction();
}

function coinState(state){
	switch(state) {
	    case "spin":
	        document.getElementById("coin").src = "./assets/coin_spin.gif";
	        break;
	    case "red":
	        document.getElementById("coin").src = "./assets/coin_lose.png";
	        break;
	    case "green":
	        document.getElementById("coin").src = "./assets/coin_win.png";
	        break;
	}
}