import { SqliteController } from "./sqlite_controller.js";
import {RecordTable} from './record_table.js';
import sqlite3 from 'sqlite3';
import { BaseVar } from "./variable/base_variable.js";

export class App{
    #record = new RecordTable();
    #sqlCtrl = new SqliteController();

    constructor(){
        this.#record.CreateTable(this.#sqlCtrl.db);
        this.#record.dataString.value = "update 1";
        //this.#record.InsertRow(this.#sqlCtrl.db);

        //this.#record.DropTable(this.#sqlCtrl.db);
        //this.#sqlCtrl.db;
        this.#sqlCtrl.db.close();
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
        this.#record.UpdateRow(db, [this.#record.uuid]);
    }
}