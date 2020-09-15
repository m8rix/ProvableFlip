pragma solidity 0.5.12;
import "./Ownable.sol";
import "./Testable.sol";
import "./provableAPI.sol";

contract CoinFlip is Ownable, Testable, usingProvable {
	uint public contractBalance;

	struct Bet {
		address player;
		uint256 value;
	}

	mapping (bytes32 => Bet) private waiting;

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
		bytes32 queryId;

		if (testing) {
			queryId = testRandom();
		} else {
			queryId = getRandom();
		}

		Bet memory bet;
		bet.player = msg.sender;
		bet.value = msg.value;
		waiting[queryId] = bet;
	}

	function stake() public payable {
		contractBalance += msg.value;
	}

	uint256 constant NUM_RANDOM_BYTES_REQUESTED = 1;

	function getRandom() internal returns (bytes32) {
		uint256 QUERY_EXECUTION_DELAY = 0;
		uint256 GAS_FOR_CALLBACK = 200000;
		return provable_newRandomDSQuery(
			QUERY_EXECUTION_DELAY,
			NUM_RANDOM_BYTES_REQUESTED,
			GAS_FOR_CALLBACK
		);
	}

	function testRandom() internal returns (bytes32) {
		bytes32 queryId = bytes32(keccak256(abi.encodePacked(msg.sender)));
		uint rand = block_time() % 2;
		string memory result = rand == 1 ? '1' : '0';

		__callback(queryId, result, bytes(abi.encodePacked(msg.sender)));
		return queryId;
	}

	function __callback(bytes32 _queryId, string memory _result, bytes memory _proof) public {
		uint256 random = uint256(keccak256(abi.encodePacked(_result))) % 2;
	
		if(random == 1) {
			address(uint160(waiting[_queryId].player)).transfer(waiting[_queryId].value * 2);
			contractBalance -= waiting[_queryId].value;
		} else {
			contractBalance += waiting[_queryId].value;
		}

		emit flipResult(waiting[_queryId].player, random == 1);
		delete waiting[_queryId];
	}

	function destroyContract() public onlyOwner{
		selfdestruct(msg.sender);
	}
}
