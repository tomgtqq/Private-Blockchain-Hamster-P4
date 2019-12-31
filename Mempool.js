/* ===== Mempool Class ==============================
|  Class with a constructor for Mempool 		    |
|  ===============================================*/

const bitcoin = require('bitcoinjs-lib');
const bitcoinMessage = require('bitcoinjs-message');
const RequestObjValidClass = require('./RequestObjValid.js');

const TimeoutRequestsWindowTime = 5*60*1000; 
const TimeoutMempoolValidWindowTime = 30*60*1000;

class Mempool {
	constructor(){
        this.mempool = []; //store all the request 
        this.timeoutRequests = []; //set up a function that delete the request automatically when timeout (5*60*1000)
     
        this.mempoolValid = []; //store valid request that user sign correctly. verify(message, address, signature)
        this.timeoutMempoolValid = [];//set up a function that delete the valid request automatically when timeout (30*60*1000)
    }

    /**
    * add a request to Mempool
    */
    addARequestValidation(request){
        let self = this;
        return new Promise(function(resolve, reject){
            self.searchRequestByWalletAddress(request.walletAddress).then((result) => {
                console.log(JSON.stringify(self.mempool));
                if(result){
                    resolve(result);
                }else{
                    self.mempool.push(request); // add the new request to mempool[] and set timeoutRequests[]
                    self.timeoutRequests[request.walletAddress] = setTimeout(function(){ self.removeValidationRequest(request.walletAddress) }, TimeoutRequestsWindowTime );
                    resolve(request);
                }
            }).catch((err) => {console.log(err); reject(err)}); 
        });
    }

    /**
    * validate request by Wallet
    * @param {*}  address 
    * @param {*}  signature 
    */
    validateRquestByWallet(address, signature){
        let self = this;
        return new Promise(function(resolve, reject){
            self.searchRequestByWalletAddress(address).then((result)=>{
                if(result){
                    let isValid = bitcoinMessage.verify(result.message, address, signature);
                    let reqObjValidate = new RequestObjValidClass.RequestObjValid(result, isValid);
                    if(isValid){
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - reqObjValidate.status.requestTimeStamp;
                        let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;              
                        reqObjValidate.status.validationWindow = timeLeft;

                        self.removeValidationRequest(address); // remove the "Request Validation" from mempool[] and timeoutRequests[] when the "Request Validation" has been verified
                        self.mempoolValid.push(reqObjValidate);
                        console.log(JSON.stringify(self.mempoolValid));
                        self.timeoutMempoolValid[reqObjValidate.status.address] = setTimeout(function(){ self.removeValidRequest(reqObjValidate.status.address) }, TimeoutMempoolValidWindowTime);
                    }
                    resolve(reqObjValidate);
                }else{
                    resolve(undefined);
                }
            }).catch((err) => {console.log(err); reject(err)});
        })
    }

    /**
    * remove request from Mempool
    */
   removeValidationRequest(address){
       try{
           this.mempool.forEach((req,index)=>{
               if(req.walletAddress === address){
                     this.mempool.splice(index,1);// delete request by index in the Mempool
                     this.timeoutRequests[address] = null;
               }
           });
        } catch(err){
            this.timeoutRequests[address] = null;
            console.log(err);
        }
    }
    /**
    * remove valid request from MempoolValid
    */
   removeValidRequest(address){
    try{
        this.mempoolValid.forEach((requestObj,index)=>{
            if(requestObj.status.address === address){
                  this.mempoolValid.splice(index,1);// delete valid request obj by index in the MempoolValid
                  this.timeoutMempoolValid[address] = null;
            }
        });
     } catch(err){
         this.timeoutMempoolValid[address] = null;
         console.log(err);
     }
 }
    /**
    * search request by address in the Mempool[]
    */
   searchRequestByWalletAddress(address){
        let self = this;
        return new Promise(function(resolve, reject){
            self.mempool.forEach(function(req){
                if(req.walletAddress === address){
                        let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
                        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                        req.validationWindow = timeLeft;
                        resolve(req);
                    }
                });
          resolve(undefined);  // the request with address can't been found in Mempool . it's new one
        } );
    }

    /**
    * search requestObj by address in the MempoolValid[]
    */
   searchRequestByWalletAddressValid(address){
    let self = this;
    return new Promise(function(resolve, reject){
        self.mempoolValid.forEach(function(reqObj){
            if(reqObj.status.address === address){
                    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - reqObj.status.requestTimeStamp;
                    let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
                    reqObj.status.validationWindow = timeLeft;
                    resolve(reqObj);
                }
            });
            resolve(undefined); 
        });
    }

}

module.exports.Mempool = Mempool;