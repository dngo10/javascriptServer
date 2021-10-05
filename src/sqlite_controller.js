import sqlite3 from 'sqlite3';

export class SqliteController{
    #sqlite3 = sqlite3.verbose();

    /**
     * @type {sqlite3.Database}
     */
    #db;


    constructor(){
        this.#db = new this.#sqlite3.Database('record.db', function(err){
            if(err) throw `ERROR: FILE NOT FOUND`;
        });

        this.#db.run( 'PRAGMA journal_mode = WAL;' );
        this.#db.run('PRAGMA foreign_keys = ON;');
    }

    get db(){return this.#db;}
}

