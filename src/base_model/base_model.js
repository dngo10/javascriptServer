import {BaseVar} from "../variable/base_variable.js";
import {Kw} from "../ultility/sqlite3_keywords.js";
import sqlite3 from "sqlite3";


export class BaseModel{
    #id = new BaseVar("ID", 0, `${Kw.notNull} ${Kw.unique}`);
    #tableName = "NONAME";

    constructor(){
        this.CreateTable = this.CreateTable.bind(this);
        this.DeleteRow = this.DeleteRow.bind(this);
        this.DropTable = this.DropTable.bind(this);
        this.GetList = this.GetList.bind(this);
        this.GetListNoId = this.GetListNoId.bind(this);
        this.HasRow = this.HasRow.bind(this);
        this.InsertRow = this.InsertRow.bind(this);
        this.SelectRow = this.SelectRow.bind(this);
        this.SelectRows = this.SelectRows.bind(this);
        this.UpdateRow = this.UpdateRow.bind(this);
    }

    /**
     * @param {BaseVar} value
     */
    set id(value) {
        if(!value) throw 'Not a valid ID';
        if(typeof this.#id.value == 'number'){
            this.#id.value = value.value;
        }else{
            throw 'type of value is not a number';
        }
    }

    get id() { return this.#id; }

    /**
     * @returns {BaseVar[]}
     */
    GetList(){return [];};

    /**
     * @returns {BaseVar[]}
     */
    GetListNoId(){return [];}

    /**
     * @param {string} value
     */
    set tableName(value) {
        if (value && !Kw.contains(value)) {
            this.#tableName = value.trim().toUpperCase();
        }else{
            throw 'Cannot set tableName';
        }
    }

    get tableName(){
        return this.#tableName;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {function(number):void} [callback]
     */
    UpdateRow(db, callback = undefined){
        let cmdStr = this.#updateRowCommand(this.id);
        let paras =[...this.GetListNoId(), this.id].map(e => e.value);
        db.run(cmdStr, paras, function(err){
            if(err){throw  `Error: Message: ${err.message}`}
            callback??(this.lastID);
        });
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar} val
     * @param {function(number):void} [callback]
     * */
    DeleteRow(db, val, callback = undefined){
        db.run(this.#deleteRowCommand(val), function(err){
            if(err){throw err.message;}
            callback??(this.lastID);
        });
        return true;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {function(number): void} [callback]
     */
    InsertRow(db, callback = undefined){
        let result = false;
        let newId = -1;
        let commandStr = this.#insertCommand(this.GetListNoId());
        let paras = this.GetListNoId().map(e =>e.value);
        db.run(commandStr, paras, function (err){
            if(err) throw  err.message;
            callback??(this.lastID);
        });
        if(newId != -1){
            result = true;
        }
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     * @param {function(any[]): void} [callback]
     */
    SelectRows(db, vals, callback = undefined){
        let result = [];
        db.all(this.#selectCommand(vals), vals.map(e =>e.value), function(err, rows){
            if(err) throw err.message;
            callback??(rows);
        });
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals 
     * @param {function(any):void} [callback] -- get a row
     */
    SelectRow(db, vals, callback = undefined){
        db.get(
            this.#selectCommand(vals), 
            vals.map(e =>e.value), 
            function(err, row){
                if(err) throw err.message;
                callback??(row);
            }
        );
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     * @param {function(any):void} [callback]
     */
    HasRow(db, vals, callback = undefined){
        let result = false;
        db.get(this.#getInsertValue(vals),
               vals.map(e => e.value),
               (err, row)=>{
                    if(err) throw err.message;
                    callback??(row);
                }
            );
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {blankCallBack} [callback]
     */
    CreateTable(db, callback = undefined){
        let comStr = this.#createTableCommand(this.GetList());
        db.run(comStr, function(err){
            if(err) throw `Damn this bug: ${err?.message}`;
            callback??(err);
        });
        return true;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {function} [callback]
     */
    DropTable(db, callback = function(){}){
        let strCmmd = this.#deleteTableCommand();
        db.exec(strCmmd, function(err){
            if(err) throw err?.message;
            callback? callback() : false;
        });
        return true;
    }

    /**
     * @param {BaseVar[]} vals
     * @param {any} row
     */
    #updateObject(vals, row){
        vals.forEach(val => {
            val.value = row[val.name];
        });

        let t = this.GetList();
    }

    /**
     * @callback blankCallBack
     */


    /* #region  Create Command */
    /**
     * @param {BaseVar} comparedVal
     */
    #deleteRowCommand(comparedVal) {
        return `DELETE FROM ${this.#tableName} WHERE ${comparedVal.getEqualQuestion()} ;`;
    }


    /**
     * @param {BaseVar} comparedVar
     */
    #updateRowCommand(comparedVar) {
        return `UPDATE ${this.#tableName} SET ${this.#createUpdateEqualString(this.GetListNoId())} WHERE ${comparedVar.getEqualQuestion()};`;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #insertCommand(vals) {
        if (vals.length == 0) return "";
        return `INSERT INTO ${this.tableName} (${this.#getInsertValue(vals)}) VALUES (${this.#getInsertQuestion(vals)});`;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #selectCommand(vals){
        if(vals.length == 0) return "";
        let cmndStr = `SELECT * FROM ${this.tableName} WHERE ${this.#createEqualString(vals)};`;
        return cmndStr;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #createTableCommand(vals) {
        let creaStr = this.#createTableVals(vals);
        return `CREATE TABLE IF NOT EXISTS ${this.tableName}(${creaStr});`;
    }

    #deleteTableCommand() {
        return `DROP TABLE IF EXISTS ${this.tableName};`;
    }
    /* #endregion */

    /* #region  support methods */

    /**
     * @param {BaseVar[]} vals
     */
    #createUpdateEqualString(vals) {
        return vals.map(val => val.getEqualQuestion()).join(" , ");
    }

    /**
     * @param {BaseVar[]} vals
     */
    #createTableVals(vals) {
        let stringFinal = "";
        let foreignRef = "";
        stringFinal = vals.map(val => val.getCreateString()
        ).join(' , ');

        let primaryKey = `, PRIMARY KEY ('${this.#id.name}' ${Kw.autoInc})`;

        foreignRef = vals.filter(function (obj) {
            return !obj.foreignTableName && obj.foreignTableName !== "";
        }).map(val => val.getForeignKey()).join(' , ');

        if (foreignRef.length != 0) {
            return stringFinal + primaryKey + ' , ' + foreignRef;
        } else {
            return stringFinal + primaryKey;
        }
    }

    /**
     * @param {BaseVar[]} vals
     */
    #createEqualString(vals) {
        return vals.map(val => val.getEqualQuestion()).join(" AND ");
    }

    /**
     * @param {BaseVar[]} vals
     */
    #getInsertValue(vals) {
        return vals.map(val => val.name).join(' , ');
    }

    /**
     * @param {BaseVar[]} vals
     */
    #getInsertQuestion(vals) {
        let str = "";
        return vals.map(val => ' ? ').join(' , ');
    }
    /* #endregion */
}
