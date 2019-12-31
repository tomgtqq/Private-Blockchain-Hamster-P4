/* ===== RequestObj Class ===================================
|  Class with a constructor for RquestObj                	 |
|  ==========================================================*/

const TimeoutRequestsWindowTime = 5*60*1000;
   /**
     * @param {*}  data - walletAddress
     */
class RequestObj {
    constructor(data){
        this.walletAddress = data ,
        this.requestTimeStamp = new Date().getTime().toString().slice( 0, -3),
        this.message = `${this.walletAddress}:${this.requestTimeStamp}:starRegistry`
        this.validationWindow = TimeoutRequestsWindowTime / 1000;   // millisecond -> second
    }
}

module.exports.RequestObj = RequestObj;   //@Cool  create obj here is better than in other file, becasue "data" sparate "controller"