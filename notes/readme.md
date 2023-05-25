# Important points

- If we have odd nodes, we duplicate last node to get the tree in proper format
- All data in nodes is hashed using sha256
- merkle tree operates at max on logN where N is number of nodes
- faster way to prove that a lead exists in a tree
- each node will hash the contents of the subsequent 2 nodes

![merkle tree representation](./images/merkle%20tree%20rep.png)

- `function verifyCalldata(bytes32[] calldata proof, bytes32 root, bytes32 leaf) internal pure returns (bool)` -> OZ library that verifies merkle proof. Merkle proof is taken as an array of `bytes32` hash and root and leaf are themselves `bytes32` value. Objective of this function is, given correct proofs and root, we can proof that leaf is part of the merkle tree

- Typically the root will be data you store in the smart contract and proof will be the data from someone created off-chain, proving to the contract that the leaf was part of the original tree.

- Note that `verifyCalldata` calls the function `processProofCalldata` that takes in leaf and proof and generates a root -> if generated root matches with input root, then submitted proof is valid & the leaf indeed belongs to the root

```
function verifyCalldata(
    bytes32[] calldata proof,
    bytes32 root,
    bytes32 leaf
) internal pure returns (bool) {
    return processProofCalldata(proof, leaf) == root;
}
```

- Note that `processProofCalldata` is running a loop on each proof and computing a hash using computed hash & the next value in proof array. To begin with, computed hash is initialized to the `leaf`

```
function processProofCalldata(
    bytes32[] calldata proof,
    bytes32 leaf,
) internal pure returns (bytes32) {
    bytes32 computedHash = leaf;
    for (uint256 i = 0; i < proof.length; i++) {
        computedHash = _hashPair(computedHash, proof[i]);
    }
    return computedHash;
}
```

- `hashPair` always takes 2 hashes together & takes the smaller hash first

```
function _hashPair(bytes32 a, bytes32 b)
    private
    pure
    returns(bytes32)
{
    return a < b ? _efficientHash(a, b) : _efficientHash(b, a);
}
```

- OZ uses assembly with `keccak256` opcode for more efficient hashing

```
function _efficientHash(bytes32 a, bytes32 b)
    private
    pure
    returns (bytes32 value)
{
    assembly {
        mstore(0x00, a)
        mstore(0x20, b)
        value := keccak256(0x00, 0x40)
    }
}
```

Alternatively, we could have used higher level instructions by doing

`keccak256(abi.encodePacked(a, b))`

## Merkle Proofs in Bitcoin

- Merkle proofs are used in bitcoin light clients who don't download entire blockchain - instead they just have merkle root of previous block, merkle root of current block, timestamp, difficulty and nonce
- A light client asks the full node (which houses entire blockchain) to provide merkle proofs for a given txn. Based on location of txn, a full node can submit a merkle proof (bytes32 array) to the light client
- light client can verify payments without downloading blockchain

---

## Merkle Proofs in Ehereum

- Ethereum not just has transactions but also holds contract state
- in addition to txn inclusion merkle proofs, there is a second state root hash that keeps track of eth balances in each address at a given block
- Then there is a third root hash for logs -> this allows anyone to prove that a particular event was emitted onchain

---

## Some use cases

### Airdropping

- Efficiently implement airdrops using merkle trees
- Here is a standard merkle distributor contract

```
contract MerkleDistributor {
    address public immutable token;
    bytes32 public immutable merkleRoot;

    mapping(address => bool) public isClaimed;

    constructor(address token_, bytes32 merkleRoot_) {
        token = token_;
        merkleRoot = merkleRoot_;
    }

    function claim(
        address account,
        uint256 amount,
        bytes32[] calldata merkleProof
    ) external {
        require(!isClaimed[account], 'Already claimed.');

        bytes32 node = keccak256(
            abi.encodePacked(account, amount)
        );
        bool isValidProof = MerkleProof.verifyCalldata(
            merkleProof,
            merkleRoot,
            node
        );
        require(isValidProof, 'Invalid proof.');

        isClaimed[account] = true;
        require(
            IERC20(token).transfer(account, amount),
            'Transfer failed.'
        );
    }
}
```

- Above is a distributor contract that can hold all tokens or alternatively be allowed to mint tokens

- Note that both `token` and `merkleRoot` are immutable and cannot be changed once the distributor contract (claimContract) is deployed

- `claim` is the core function in a distributor contract

- takes in the user address, the amound and the Merkle proof.

- `claim` verifies

  - original Merkle tree contained a leaf with the values matching the account address and amount
  - that the user hasn't already claimed the tokens.

- ` require(!isClaimed[account], 'Already claimed.');` checks if claim already made. Only when claim is not made is the merkle proof verified against root

- node is a hash of account address and amount. And then node, along with proof and root is submitted. Note that `merkleRoot` is not changeable as it is immutable and gets set at the time of deployment

```
    bytes32 node = keccak256(
            abi.encodePacked(account, amount)
        );
        bool isValidProof = MerkleProof.verifyCalldata(
            merkleProof,
            merkleRoot,
            node
        );
        require(isValidProof, 'Invalid proof.');
```

- Once done, `   isClaimed[account] = true;` claimed is set to true

## Proof creation

- Major part in using merkle trees is to have a method to generate proofs
- We can use `merkletreejs` to generate proofs for a given tree
-
