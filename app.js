//Importing Express.js module
const express = require("express");
//Importing BodyParser.js module
const bodyParser = require("body-parser");
// Importing Blockchain
const BlockchainClass = require("./BlockChain.js");
// Importing Mempool
const MempoolClass = require("./Mempool.js");
const morgan = require("morgan");


/**
 * Class Definition for the REST API
 */
class ApplicationServer {

    /**
     * Constructor that allows initialize the class 
     */
    constructor() {
		this.app = express();
		this.initExpress();
		this.initExpressMiddleWare();
		this.blockchain =  new BlockchainClass.Blockchain();
		this.mempool = new MempoolClass.Mempool();
		this.initControllers();
		this.start();
	}

    /**
     * Initilization of the Express framework
     */
	initExpress() {
		this.app.set("port", 8000);  
	}

    /**
     * Initialization of the middleware modules
     */
	initExpressMiddleWare() {
		this.app.use(bodyParser.urlencoded({extended:true}));
		this.app.use(bodyParser.json());
		this.app.use(morgan("dev"));
	}

    /**
     * Initilization of all the controllers
     */
	initControllers() {
		require("./BlockController.js")(this.app,this.blockchain,this.mempool);  //@cool app.js => this.app = express();
		require("./MempoolController.js")(this.app,this.blockchain,this.mempool);
	}

    /**
     * Starting the REST Api application
     */
	start() {
		let self = this;
		this.app.listen(this.app.get("port"), () => {
			console.log(`Server Listening for port: ${self.app.get("port")}`);
		});
	}

}

new ApplicationServer();