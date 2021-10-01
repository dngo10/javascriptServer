import sqlite3 from 'sqlite3';

export class SqliteController{
    #sqlite3 = sqlite3.verbose();

    /**
     * @type {sqlite3.Database}
     */
    #db;


    constructor(){
        this.#db = new this.#sqlite3.Database('../record.db', function(err){
            if(err) throw `ERROR: ${err.message}`;
        });
    }

    get db(){return this.#db;}
}

