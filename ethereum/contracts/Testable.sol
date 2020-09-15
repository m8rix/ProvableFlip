pragma solidity 0.5.12;

contract Testable {
	// Mock tests
	// This is not safe at all and would not be used in production code.
	// Newer EVM versions support chain_id() method so I could update this to assert onlyGanache
	uint private mock_time;
	bool internal testing;

	function block_time() internal view returns(uint){
		return mock_time > 0 ? mock_time : now;
	}

	function freeze_time(uint mocked_time) public{
		mock_time = mocked_time;
	}

	function unfreeze_time() public{
		mock_time = 0;
	}

	function test_mode() public{
		testing = true;
	}
}
