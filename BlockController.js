const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js'); 
const StarDataObjClass = require('./StarDataObj.js');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController
     * @param {*} app 
     * @param {class Object}  blockchainObj
     * @param {class Object}  mempoolObj
     */

    constructor(app,blockchainObj,mempoolObj) {
        this.app = app;   //@cool app.js => this.app = express();
        this.mempool = mempoolObj;
        this.blockchain= blockchainObj;
        this.getBlockByHeight();
        this.addNewBlockWithStarData();
        this.getStarBlockByHash();
        this.getBlockchain();
        this.getBlocksByWalletAddress();
    }

    /**
     * GET Endpoint to retrieve a block by blockheight, url: "/block/:blockheight"
     */
    getBlockByHeight() {
        this.app.get("/block/:blockheight", (req, res) => {
            if(req.params.blockheight ){
                console.log(req.params.blockheight)
                let height = req.params.blockheight ; 
                this.blockchain.getBlock(height).then((block) => {
                    if (block){
                        let blockObj = JSON.parse(block);
                        blockObj.body.star.storyDecoded = hex2ascii(blockObj.body.star.story);
                        return res.status(200).json(blockObj);  // @cool utilize .send method to send data
                    } else {
                        return res.status(404).send("Not Found");
                    }
                }).catch((err) => { console.log(err); return res.status(500).send("Internal Server Error");});          
            }
        });
    }

    /**
     * GET Endpoint to retrieve a block with start data by Hash, url: "/stars/hash:[HASH]"
     * [testcase]
     * curl -X GET \
     * http://localhost:8000/stars/hash:[HASH]\
     */
    getStarBlockByHash() {
        this.app.get("/stars/hash:value", (req, res) => {
            if(req.params.value){
                let hash = req.params.value ; 
                this.blockchain.getBlockByHash(hash).then((block) => {
                    if (block){
                        block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                        return res.status(200).send(block);  // @cool utilize .send method to send data
                    } else {
                        return res.status(404).send("Not Found");
                    }
                }).catch((err) => { console.log(err); return res.status(500).send("Internal Server Error");});          
            }else{
                return res.status(400).send("Please Check request parameters")
            }
        });
    }

    /**
     * GET Endpoint to retrieve blockchain , url: "/api/blockchain"
     * [testcase]
     * curl -X GET \
     * http://localhost:8000/api/blockchain \
     */
    getBlockchain(){
        this.app.get("/api/blockchain", (req, res) => {
            this.blockchain.getBlockChain().then((blockchain) => {
                    if(blockchain){
                        return res.status(200).send(blockchain);
                    }else{
                        return res.status(404).send("Not Found");
                        }
                }).catch((err) => { console.log(err);return res.status(500).send(err);});
            })
        }
                             
    /**
     * GET Endpoint to retrieve blockchain , url: "/stars/address:[ADDRESS]"
     * This endpoint response contained a list of Stars because of one wallet 
     * address can be used to register multiple Stars.
     * [testcase]
     * curl -X GET \
     * http://localhost:8000/stars/address:[ADDRESS] \
     */
    getBlocksByWalletAddress(){
        this.app.get("/stars/address:value", (req, res) => {      
            if(req.params.value){
                let walletAddress = req.params.value;
                let blocks = [];
                this.blockchain.getBlockChain().then((blockchain) => {
                    if(blockchain){
                            blockchain.forEach((block) => {                    
                               if(block.body.address === walletAddress){
                                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);  
                                    blocks.push(block);
                                   }
                                });
                                  if(blocks){
                                    return res.status(200).json(blocks);
                                  }else{
                                    return res.status(404).send("Not Found");
                                  }
                            }else{
                                    return res.status(404).send("Not Found");
                                  }
                     }).catch((err) => { console.log(err);return res.status(500).send(err);});
                }else{
                         return res.status(400).send("Please Check request parameters")
                     }
            })
        }

    /**
     * POST Endpoint to add star data by a new Block, url: "/api/star"
     */
    addNewBlockWithStarData() {
        this.app.post("/block", (req, res) => {
            if(req.body.address && req.body.star){
                this.mempool.searchRequestByWalletAddressValid(req.body.address).then((result)=>{
                    if(result){
                        let StarDataObj  = new StarDataObjClass.StarDataObj(req.body.address, req.body.star)
                        if(StarDataObj.checkStarDataValidity()){  
                                let body = StarDataObj;                       
                                let block = new BlockClass.Block(body);   
                                this.blockchain.addBlock(block).then((block) => {
                                if(block){
                                        this.mempool.removeValidRequest(req.body.address);
                                        return res.status(200).json(JSON.parse(block));  // @cool utilize .send method to send data 
                                }else{
                                        return res.status(500).send("Internal Server Error");
                                        }
                                }).catch((err) => { console.log(err); return res.status(500).json(err);})
                            }else{
                                return res.status(400).send("Please Check RA,DEC data")
                            }
                        }else{
                            return res.status(401).send("The address unauthorized")
                        }  
                    })
                }else{
                    return res.status(400).send("Please Check request parameters")
                }
            });
        }





}
/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app, blockchainObj, mempoolObj) => { return new BlockController(app,blockchainObj,mempoolObj);}