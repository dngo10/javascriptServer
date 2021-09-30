import { Database } from 'sqlite3';

export class SqliteController{
    #sqlite3 = require('sqlite3').verbose();
    /**
     * @type {Database}
     */
    #db;


    constructor(){
        this.#db = new this.#sqlite3.Database(':memory');
    }

    get sqlite(){return this.#sqlite3;}
    get db(){return this.#db;}
}

