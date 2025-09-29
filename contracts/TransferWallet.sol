// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @dev Contract module that helps prevent reentrant calls to a function.
 *
 * Inheriting from `ReentrancyGuard` will make the {nonReentrant} modifier
 * available, which can be applied to functions to make sure there are no nested
 * (reentrant) calls to them.
 *
 * Note that because there is a single `nonReentrant` guard, functions marked as
 * `nonReentrant` may not call one another. This can be worked around by making
 * those functions `private`, and then adding `external` `nonReentrant` entry
 * points to them.
 *
 * TIP: If you would like to learn more about reentrancy and alternative ways
 * to protect against it, check out our blog post
 * https://blog.openzeppelin.com/reentrancy-after-istanbul/[Reentrancy After Istanbul].
 */
abstract contract ReentrancyGuard {
    // Booleans are more expensive than uint256 or any type that takes up a full
    // word because each write operation emits an extra SLOAD to first read the
    // slot's contents, replace the bits taken up by the boolean, and then write
    // back. This is the compiler's defense against contract upgrades and
    // pointer aliasing, and it cannot be disabled.

    // The values being non-zero value makes deployment a bit more expensive,
    // but in exchange the refund on every call to nonReentrant will be lower in
    // amount. Since refunds are capped to a percentage of the total
    // transaction's gas, it is best to keep them low in cases like this one, to
    // increase the likelihood of the full refund coming into effect.
    uint256 private constant _NOT_ENTERED = 1;
    uint256 private constant _ENTERED = 2;

    uint256 private _status;

    constructor() {
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Prevents a contract from calling itself, directly or indirectly.
     * Calling a `nonReentrant` function from another `nonReentrant`
     * function is not supported. It is possible to prevent this from happening
     * by making the `nonReentrant` function external, and making it call a
     * `private` function that does the actual work.
     */
    modifier nonReentrant() {
        _nonReentrantBefore();
        _;
        _nonReentrantAfter();
    }

    function _nonReentrantBefore() private {
        // On the first call to nonReentrant, _status will be _NOT_ENTERED
        require(_status != _ENTERED, "ReentrancyGuard: reentrant call");

        // Any calls to nonReentrant after this point will fail
        _status = _ENTERED;
    }

    function _nonReentrantAfter() private {
        // By storing the original value once again, a refund is triggered (see
        // https://eips.ethereum.org/EIPS/eip-2200)
        _status = _NOT_ENTERED;
    }

    /**
     * @dev Returns true if the reentrancy guard is currently set to "entered", which indicates there is a
     * `nonReentrant` function in the call stack.
     */
    function _reentrancyGuardEntered() internal view returns (bool) {
        return _status == _ENTERED;
    }
}

// File: @openzeppelin/contracts/utils/Context.sol



/**
 * @dev Provides information about the current execution context, including the
 * sender of the transaction and its data. While these are generally available
 * via msg.sender and msg.data, they should not be accessed in such a direct
 * manner, since when dealing with meta-transactions the account sending and
 * paying for execution may not be the actual sender (as far as an application
 * is concerned).
 *
 * This contract is only required for intermediate, library-like contracts.
 */
abstract contract Context {
    function _msgSender() internal view virtual returns (address) {
        return msg.sender;
    }

    function _msgData() internal view virtual returns (bytes calldata) {
        return msg.data;
    }
}

abstract contract Ownable is Context {
    address private _owner;

    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);

    /**
     * @dev Initializes the contract setting the deployer as the initial owner.
     */
    constructor() {
        _transferOwnership(_msgSender());
    }

    /**
     * @dev Throws if called by any account other than the owner.
     */
    modifier onlyOwner() {
        _checkOwner();
        _;
    }

    /**
     * @dev Returns the address of the current owner.
     */
    function owner() public view virtual returns (address) {
        return _owner;
    }

    /**
     * @dev Throws if the sender is not the owner.
     */
    function _checkOwner() internal view virtual {
        require(owner() == _msgSender(), "Ownable: caller is not the owner");
    }

    /**
     * @dev Leaves the contract without owner. It will not be possible to call
     * `onlyOwner` functions anymore. Can only be called by the current owner.
     *
     * NOTE: Renouncing ownership will leave the contract without an owner,
     * thereby removing any functionality that is only available to the owner.
     */
    function renounceOwnership() public virtual onlyOwner {
        _transferOwnership(address(0));
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Can only be called by the current owner.
     */
    function transferOwnership(address newOwner) public virtual onlyOwner {
        require(newOwner != address(0), "Ownable: new owner is the zero address");
        _transferOwnership(newOwner);
    }

    /**
     * @dev Transfers ownership of the contract to a new account (`newOwner`).
     * Internal function without access restriction.
     */
    function _transferOwnership(address newOwner) internal virtual {
        address oldOwner = _owner;
        _owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }
}


contract TransferWallet is Context,Ownable,ReentrancyGuard {

    // #主币额度
    mapping (address => uint256) public depositMainTokenQuota;

    address public TokenAddress;

    event Withdraw(address,uint);
    event Deposit(address,uint);
    event Transfer(address[] ,uint256[] );

    // 设置token地址
    function setTokenAddress(address tokenAddress) external onlyOwner {
        TokenAddress = tokenAddress;
    }
    // 获取token余额
    function TokenBalanceOf() public view returns (uint256) {
        IERC20 token = IERC20(TokenAddress);
        return token.balanceOf(address(this));
    }
    // 批量转账token
    function transferToken(address[] memory recipients,uint256[] memory amounts) external onlyOwner  returns (bool) {
        uint256 balance = TokenBalanceOf();
        require(balance != 0,"Token balance is 0");
        uint256 totalAmount = 0;
        uint amountlength = amounts.length;
        for (uint i= 0;i<amountlength;){
            totalAmount += amounts[i];
            unchecked{
                i++;
            }
        }
        require(totalAmount>0,"amount cant be 0");
        _batchTransferToken(recipients, amounts);
        return true;
    }

    // 转账方法
    function _batchTransferToken(address[] memory recipients,uint256[] memory amounts) internal returns (bool){
        require(recipients.length == amounts.length, "Number of recipients must be equal to the number of amounts.");
        IERC20 token = IERC20(TokenAddress);
        uint addresslength  = recipients.length;
        for(uint i = 0 ;i<addresslength;){
            bool success = token.transfer(recipients[i], amounts[i]);
            require(success, "Token transfer failed");
            unchecked{
                i++;
            }
        }
        emit Transfer(recipients,amounts);
        return true;
    }




    function MainTokenBalanceOf()external view returns (uint256) {
        return address(this).balance;
    }

    function getMainTokenQuota(address from) view internal returns(uint256){
        return depositMainTokenQuota[from];
    }

    function depositMainToken() payable public  nonReentrant returns(address,uint256){
        uint256 quota = getMainTokenQuota(_msgSender());
        if(quota == 0){
            depositMainTokenQuota[_msgSender()] = msg.value;  
        }else {
            depositMainTokenQuota[_msgSender()] = msg.value+quota; 
        }
        emit Deposit(_msgSender(),msg.value);
        return (_msgSender(),msg.value);
    }




    function transferMainToken(address[] memory recipients,uint256[] memory amounts) external  returns (bool) {
        uint256 quota = getMainTokenQuota(_msgSender());
        require(quota != 0,"Not deposit amount");
        uint256 totalAmount = 0;
        uint amountlength = amounts.length;
        for (uint i= 0;i<amountlength;){
            totalAmount += amounts[i];
            unchecked{
                i++;
            }
        }
        require(totalAmount<=quota,"Address Insufficient deposit amount");
		depositMainTokenQuota[_msgSender()]=quota-totalAmount;
        _batchTransferMainToken(recipients, amounts);
        return true;
    }

    function _batchTransferMainToken(address[] memory recipients,uint256[] memory amounts) internal returns (bool){
        require(recipients.length == amounts.length, "Number of recipients must be equal to the number of amounts.");
        uint addresslength  = recipients.length;
        for(uint i = 0 ;i<addresslength;){
            (bool callSuccess, ) = recipients[i].call{value: amounts[i]}("");
            require(callSuccess,"transfer success");
            unchecked{
                i++;
            }
        }
        return true;
    }

    function withdraw(uint256 amount) external onlyOwner returns (bool){
        (bool callSuccess, ) = payable(msg.sender).call{value: amount}("");
        require(callSuccess, "withdraw failed");
        emit Withdraw(msg.sender,amount);
        return true;
    }

    fallback() external payable {
        depositMainToken();
    }

    receive() external payable {
        depositMainToken();
    }
}