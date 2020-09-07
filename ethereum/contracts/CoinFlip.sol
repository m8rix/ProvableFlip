pragma solidity 0.5.12;
import "./Testable.sol";

contract CoinFlip is Testable {
	uint public contractBalance;

	mapping (address => uint) private stakings;

	modifier betCovered(){
		require(msg.value < contractBalance);
		_;
	}

	modifier minimumBet(uint bid){
		require(msg.value >= bid);
		_;
	}

    event flipResult(address player, bool result);

	function flip() public payable minimumBet(1 szabo) betCovered {
		uint winning = block_time() % 2;
		if(winning == 1) {
			uint total = (msg.value * 2);
			uint house = (total * 1) / 100;

			msg.sender.transfer(total - house);
			contractBalance -= (msg.value - house);
		} else {
			contractBalance += msg.value;
		}
		emit flipResult(msg.sender, winning == 1);
	}

	function stake() public payable {
		contractBalance += msg.value;
		stakings[msg.sender] += msg.value;
	}
}
