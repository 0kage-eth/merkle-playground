const { MerkleTree } = require("merkletreejs")
const { ethers } = require("ethers")
const SHA256 = require("crypto-js/sha256")
const { addresses } = require("../data/addresses")

const fs = require("fs")

const main = async () => {
  //create a merkle tree

  const leaves = addresses.map((a) => SHA256(a))
  const tree = new MerkleTree(leaves, SHA256)
  //   console.log("merkle tree", tree.toString())

  console.log("merkle root", tree.bufferToHex(tree.getRoot()))
  console.log("merkle root hash", tree.getHexRoot())
  console.log("tree depth", tree.getDepth())
  console.log("get layer count", tree.getLayerCount())
  console.log("hex layers", tree.getHexLayers())
  console.log("hex layers flat", tree.getHexLayersFlat())
  console.log("layers object", tree.getLayersAsObject())
  console.log("layers flat", tree.getLayersFlat())
  console.log("get hex leaves", tree.getHexLeaves())
  console.log("get hex multi proof", tree.getHexMultiProof([2, 3]))
  console.log("get hex proof", tree.getHexProof(SHA256(addresses[1])))
  console.log("get leaf count", tree.getLeafCount())
  console.log("get first leaf", tree.bufferToHex(tree.getLeaf(0)))
  console.log("get leaf index", tree.getLeafIndex(SHA256(addresses[0])))
  console.log("all leaves", tree.getLeaves())
}

main()
  .then(() => {
    process.exit(0)
  })
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
