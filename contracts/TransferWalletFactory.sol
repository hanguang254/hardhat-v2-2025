// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./TransferWallet.sol";

contract TransferWalletFactory {
    event WalletDeployed(address walletAddress, address owner);
    address public Owner;



    constructor(){
        Owner = msg.sender;
    }

    function getWalletBytecode() public pure returns (bytes memory) {
        return type(TransferWallet).creationCode;
    }


    function getAddress(bytes32 salt) public view returns (address) {
        bytes memory bytecode = getWalletBytecode();
        bytes32 hash = keccak256(
            abi.encodePacked(
                bytes1(0xff),
                address(this),
                salt,
                keccak256(bytecode)
            )
        );
        return address(uint160(uint256(hash)));
    }

    function deployWallet(bytes32 salt) external returns (address walletAddress) {
        require(msg.sender == Owner,"only Owner deploy");
        bytes memory bytecode = getWalletBytecode();
        assembly {
            walletAddress := create2(0, add(bytecode, 0x20), mload(bytecode), salt)
            if iszero(walletAddress) {
                revert(0, 0)
            }
        }
        // 转移 ownership 给 msg.sender
        TransferWallet(payable(walletAddress)).transferOwnership(msg.sender);
        emit WalletDeployed(walletAddress, msg.sender);
    }
}
