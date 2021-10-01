import { SqliteController } from "./sqlite_controller.js";
import {RecordTable} from './record_table.js';

export class App{
    #record = new RecordTable();
    #sqlCtrl = new SqliteController();

    constructor(){
        this.#record.CreateTable(this.#sqlCtrl.db);
        this.#record.DropTable(this.#sqlCtrl.db);
        //this.#sqlCtrl.db;
        this.#sqlCtrl.db.close();
    }
}