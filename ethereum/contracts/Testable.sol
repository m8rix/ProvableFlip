pragma solidity 0.5.12;
import "./Ownable.sol";

contract Testable is Ownable{
	// Mock tests
	uint private mock_time;

	function block_time() internal view returns(uint){
		return mock_time > 0 ? mock_time : now;
	}

	// This should be onlyTestEnv but I couldn't figure out how to restrict to ganache network
	function freeze_time(uint mocked_time) public onlyOwner{
		mock_time = mocked_time;
	}

	function unfreeze_time() public onlyOwner{
		mock_time = 0;
	}
}