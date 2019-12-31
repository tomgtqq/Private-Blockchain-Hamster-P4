
/* ===== MempoolController Class ===================================
|  Controller Definition to encapsulate routes to work with Mempool	|
|  =================================================================*/

const RequestObjClass =  require('./RequestObj.js');


class MempoolController {
    /**
     * @param {* express()}  app 
     * @param {class Object}  blockchainObj
     * @param {class Object}  mempoolObj
     */

    constructor(app,blockchainObj,mempoolObj){
        this.app = app;   //@cool app.js => this.app = express();
        this.mempool = mempoolObj;
        this.blockchain = blockchainObj;
        this.requestValidation();  
        this.validateSignature();
    }

    /**
     * POST Endpoint to request a Validation"
     * [testcase]:
     *    curl -X POST \
     *    http://localhost:8000/requestValidation \
     *    -H 'Content-Type: application/json' \
     *    -H 'cache-control: no-cache' \
     *    -d '{
     *          "address":"your wallet address"
     *        }'
     */
    
    requestValidation() {
        this.app.post("/requestValidation", (req, res) => {  
            if(req.body.address){
                let requestObj = new RequestObjClass.RequestObj(req.body.address);
                this.mempool.addARequestValidation(requestObj).then((obj)=>{
                    if(obj){
                        return res.status(200).send(obj);
                    }else{
                        return res.status(500).send("Internal Server Error");
                    }
                }).catch((err) => {return res.status(500).send(err);})
            }else{
                return  res.status(400).send("Please check body paramater");
            }
        })
    }



    /**
     * POST Endpoint to Validate Signature"  
     * [testcase]
     * curl -X POST \
     * http://localhost:8000/message-signature/validate \
     * -H 'Content-Type: application/json' \
     * -H 'cache-control: no-cache' \
     * -d '{
     *       "address":"your address",
     *       "signature":"your signature"
     *     }'
     */

    validateSignature(){
        this.app.post("/message-signature/validate",(req, res)=>{
            if(req.body.address && req.body.signature){
                this.mempool.validateRquestByWallet(req.body.address, req.body.signature).then((result)=>{
                    if(result){
                        return res.status(200).send(result);
                    }else{
                        return res.status(400).send("Bad Request! Please Check your Address");
                    }
                }).catch((err) => {return res.status(500).send(err);})
            }else{
                return  res.status(400).send("Please check body paramater");
            }
        });
    }

}

/**
 * Exporting the MempoolController class
 * @param {*} app 
 */
module.exports = (app, blockchainObj, mempoolObj) => { return new MempoolController(app, blockchainObj, mempoolObj);}