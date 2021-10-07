import { SqliteController } from "./sqlite_controller.js";
import {RecordTable} from './record_table.js';
import sqlite3 from 'sqlite3';
import { BaseVar } from "./variable/base_variable.js";

export class App{
    #record = new RecordTable();
    #sqlCtrl = new SqliteController();

    get sqlCtrl(){return this.#sqlCtrl;}
    get record() {return this.#record;}

    getRecord(){return this.record;}
    getSqlCtrl() {return this.#sqlCtrl;}

    constructor(){

        this.getRecord = this.getRecord.bind(this);
        this.getSqlCtrl = this.getSqlCtrl.bind(this);

        this.#record.DropTable(this.#sqlCtrl.db, this.DropCallBack);
        //this.#record.CreateTable(this.#sqlCtrl.db);
        this.#sqlCtrl.db.close();
    }

    /**
     * @param {Error} [err]
     * @param {function():void} [callback]
     */

    DropCallBack(err = undefined, callback = () => {this.getRecord().CreateTable(this.getSqlCtrl().db);}){
        callback();
        if(!err) return true;
        return false;
    }

    Temp(){
        this.#sqlCtrl = new SqliteController();
        this.#record.dataString.value = "update 0";
        this.#record.InsertRow(this.#sqlCtrl.db);
        this.#sqlCtrl.db.close();
    }

    Temp2(){
        this.#sqlCtrl = new SqliteController();
        this.#record.dataString.value = "update 2";
        this.#record.uuid.value = "not here, I changed it.";

        this.#record.UpdateRow(this.#sqlCtrl.db);
        this.#sqlCtrl.db.close();
    }

    Temp3(){
        this.#sqlCtrl = new SqliteController();
        let tableTemp = new RecordTable();
        tableTemp.id.value = this.#record.id.value;
        tableTemp.SelectRow(this.#sqlCtrl.db, [tableTemp.id]);
        this.#sqlCtrl.db.close();       
        console.log(tableTemp.uuid.value);
    }

    /**
     * @param {sqlite3.Database} db
     * @param {string} record
     */
    AddRecord(db, record){
        this.#record.dataString.value = record;
        this.#record.InsertRow(db);
    }

    /**
     * @param {sqlite3.Database} db
     * @param {string} uuid
     */
    GetRecord(db, uuid){
        let uuidBaseVar = new BaseVar("uuid", uuid);
        this.#record.SelectRow(db, [uuidBaseVar]);
    }

    /**
     * @param {sqlite3.Database} db
     */
    UpdateRecord(db){
        this.#record.UpdateRow(db);
    }
}