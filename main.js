var web3 = new Web3(Web3.givenProvider);
var contractInstance;
var accounts

$(document).ready(function(){
	// This is non-production code, pulling in the build file makes local dev with truffle smoother
	$.getJSON('./ethereum/build/contracts/CoinFlip.json', function(coinFlipBuild){
		window.ethereum.enable().then(function(accounts){
			contractInstance = getContract(coinFlipBuild, accounts[0]);
			// contractInstance = new web3.eth.Contract(coinFlipBuild.abi, coinFlipBuild.networks[network_id].address, {from: accounts[0]});

			setWalletBalance(accounts[0]);
			setDefaults(accounts[0]);

			// Listen for flip results
			contractInstance.events.flipResult({filter: {address: accounts[0]}}, async function(error, event){
				flipResult(error, event);
			})

		});
		$("#gamble_button").click(coinFlip);
	});
});

function getContract(build, account){
	var network_id = Object.keys(build.networks)[0];       

	return new web3.eth.Contract(
		build.abi,
		build.networks[network_id].address,
		{from: account}
	)
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
	} else {
		$("#gamble_button").attr("disabled", true);
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