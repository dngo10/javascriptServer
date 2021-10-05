import {BaseVar} from "../variable/base_variable.js";
import {Kw} from "../ultility/sqlite3_keywords.js";
import sqlite3 from "sqlite3";


export class BaseModel{
    #id = new BaseVar("ID", 0, `${Kw.notNull} ${Kw.unique}`);
    #tableName = "NONAME";

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
     */
    UpdateRow(db){
        let cmdStr = this.#updateRowCommand(this.id);
        let paras =[...this.GetListNoId(), this.id].map(e => e.value);
        db.run(cmdStr, ...paras);
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar} val
     */
    DeleteRow(db, val){
        db.exec(this.#deleteRowCommand(val), (err)=>{
            if(err) throw err.message;
        });
        return true;
    }

    /**
     * @param {sqlite3.Database} db
     */
    InsertRow(db){
        let self = this;
        let result = false;
        let newId = -1;
        let commandStr = this.#insertCommand(this.GetListNoId());
        let paras = this.GetListNoId().map(e =>e.value);
        db.run(commandStr, paras, function (err){
            if(err) throw  err.message;
            newId = this.lastID;
            self.id.value = newId;
        });
        if(newId != -1){
            result = true;
        }
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     */
    SelectRows(db, vals){
        let result = [];
        db.all(this.#selectCommand(vals), vals.map(e =>e.value), function(err, rows){
            if(err) throw err.message;
            result = [...rows];
        });
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     */
    SelectRow(db, vals){
        let self = this;
        db.get(
            this.#selectCommand(vals), 
            vals.map(e =>e.value), 
            function(err, row){
                if(err) throw err.message;
                self.#updateObject(self.GetList(), row);
                
            }
        );
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     */
    HasRow(db, vals){
        let result = false;
        db.all(this.#getInsertValue(vals),
               vals.map(e => e.value),
               (err, rows)=>{
                    if(err) throw err.message;
                    else if(rows.length) result = true;
                    return result;
                }
            );
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     */
    CreateTable(db){
        let comStr = this.#createTableCommand(this.GetList());
        db.run(comStr, function(err){
            if(err) throw `Damn this bug: ${err?.message}`;
        });
        return true;
    }

    /**
     * @param {sqlite3.Database} db
     */
    DropTable(db){
        let strCmmd = this.#deleteTableCommand();
        db.exec(strCmmd, (err)=>{
            if(err) throw err?.message;
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
