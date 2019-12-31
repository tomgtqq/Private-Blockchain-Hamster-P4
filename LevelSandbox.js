/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key, (err, value) => {
                if(err){
                    if (err.type == 'NotFoundError') {
                        resolve(undefined);  //@cool if NotFoundError 
                    }else {
                        reject(err);
                    }
                }else {
                    resolve(value);
                }       
            });
        });
    }

    // Get All Blocks in DB
    getAllBlocks(){
        let self = this;
        let dataArray = [];
        return new Promise(function(resolve, reject){
            self.db.createReadStream().on('data', function(chunk){
                dataArray.push(chunk);
            }).on('error', function(err){
                reject(error);
            }).on('close', function(){
                resolve(JSON.stringify(dataArray).toString());
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    reject(err);
                }
                resolve(value);
            });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        return new Promise(function(resolve, reject){
            let count = 0;
            self.db.createReadStream().on('data', function(chunk){
                count++;
            }).on('error', function(err){
                reject(error);
            }).on('close', function(){
                resolve(count - 1);
            });
        });
    }

// Get block by hash
getBlockByHash(hash) {
    let self = this;
    let block = null;
    return new Promise(function(resolve, reject){
        self.db.createReadStream().on('data', function(chunk){
            let data = JSON.parse(chunk.value);
            console.log(data.hash );
            if(data.hash === hash){
                block = data;
              }
        })
        .on('error', function (err) {
            reject(err)
        })
        .on('close', function () {
            resolve(block);
        });
    });
}       

}

module.exports.LevelSandbox = LevelSandbox;
