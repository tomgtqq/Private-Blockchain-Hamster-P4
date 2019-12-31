/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {

    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock(); 
    }

    // Helper method to create a Genesis Block (always with height= 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        this.getBlockHeight().then((height) => {
            // height 0 is Genesis Block, if height = -1, there isn't genesis block  
            if(height === -1){
                let genesisBlock = new Block.Block("First block in the chain - Genesis block");
                this.addBlock(genesisBlock).then((blook) => {
                    console.log(blook);
                })
            }    
        }).catch((err) => { console.log(err);}) ;
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        let self = this;
        return new Promise(function(resolve, reject){
                self.bd.getBlocksCount().then((height) => {
                    resolve (height) ;
                }).catch((err) => {
                    reject(err);
                })
         })  
    }

    // Get blockchain data array and blockchain height
    getBlockChain() {
        let self = this;
        let blockchain = []
        return new Promise(function(resolve, reject){
                self.bd.getAllBlocks().then((dataArray) => {      
                    JSON.parse(dataArray).forEach((data , index) => {
                        blockchain.push(JSON.parse(data.value))
                    })
                    resolve (blockchain.sort(function(a,b){return (a.height - b.height)})) ;
                }).catch((err) => {
                    reject(err);
                })
         })  
    }

    // Add new block
    addBlock(obj) {
        let self = this;
        return new Promise(function(resolve, reject){
            self.getBlockHeight().then((height) => {   
                obj.height = height + 1; // new block height
                return self.getBlock(height) // get previous block
                }) 
                .then((previousBlock) => {
                    if(previousBlock){
                        obj.previousBlockHash = JSON.parse(previousBlock).hash.toString();  // get previous block hash, if have previous block 
                    }
                    // Block hash with SHA256 using newBlock and converting to a string 
                    obj.hash = SHA256(JSON.stringify(obj)).toString();
                    // converting newBlock data to value  
                    // return self.bd.addLevelDBData(obj.height, JSON.stringify(obj));  // Adding block to chain
                    return self.bd.addLevelDBData(obj.height, JSON.stringify(obj).toString());  // Adding block to chain
                    })
                    .then((result) => {
                        if(!result){
                            console.log("Error Adding new block to the chain");
                            reject(new TypeError("Error Adding new block to the chain"));
                        }else{
                            resolve(result);
                        }
                    }).catch((err) => { console.log(err); reject(err); })
                });
    }

    // Get Block By Height
    getBlock(height) {
        let self = this;
        return new Promise(function(resolve, reject){
            self.bd.getLevelDBData(height).then((block) => {
                resolve (block);
            }).catch((err) => {
                reject(err);
            });
        })
    }

    // Get Block By Hash
        getBlockByHash(Hash) {
            let self = this;
            return new Promise(function(resolve, reject){
                self.bd.getBlockByHash(Hash).then((block) => {
                    resolve (block);
                }).catch((err) => {
                    reject(err);
                });
            })
        }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        let self = this ;
        return new Promise(function(resolve, reject){
            self.getBlock(height).then((data) => { 
                let block = JSON.parse(data)
                // Retrieve hash from block
                const blockHash = block.hash;
                console.log(`validateBlock - getBlock - blockHash : ${blockHash}`)
                // Generate Hash by SHA256 
                block.hash = ""; // Hash the block again. @cool
                const validBlockHash = SHA256(JSON.stringify(block)).toString();
                console.log(`validateBlock - SHA256 - validBlockHash : ${validBlockHash}`)

                if(blockHash === validBlockHash){
                    resolve(true);
                } else {
                    resolve(false)
                }
            }).catch((err) => { console.log(err); reject(err)});
        })
    }
    
    // Validate Blockchain
    validateChain() {
        let self =  this ;
        let errorLog = []
  
        return new Promise(function (resolve , reject) {   
            self.getBlockChain().then((blockchain) => {
                let promises = [];
                blockchain.forEach((block,index)=>{
                    // add Promise into promises to operate Promise.all 
                    promises.push(self.validateBlock(block.height));
                    //Validate the links between blocks
                    if(block.height > 0){
                        let previousBlockHash = block.previousBlockHash ;
                        let hash = blockchain[index - 1].hash; // the hash is previous Block.hash
                        if(hash != previousBlockHash){
                            errorLog.push(`Error - Block Height: ${block.height} - Previous Hash don't match.`)
                        }
                    }
                });
                // validate each block in the blockchain @cool run all those promises in parallel
                Promise.all(promises).then((results) => {
                    results.forEach((valid, index) => {
                        if(!valid){
                            errorLog.push(`Error - Block Height: ${blockchain[index].height} - Has been Tampered.`)
                        }
                    });
                    resolve(errorLog);
                })
            })
        })
    }
}

module.exports.Blockchain = Blockchain;
