import {BaseVar} from "../variable/base_variable.js";
import {Kw} from "../ultility/sqlite3_keywords.js";
import sqlite3 from "sqlite3";


export class BaseModel{
    #id = new BaseVar("ID", 0, Kw.notNull);
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
     * @param {BaseVar[]} vals
     */
    UpdateRow(db, vals){
        db.run(this.#updateRowCommand(vals, this.#id), vals.map(e => e.value), (err)=>{
            if(err) throw err.message;
        })
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
        let result = false;
        let newId = -1;
        db.run(this.#insertCommand(this.GetListNoId()), this.GetListNoId().map(e =>e.value), function (err){
            if(err) throw  err.message;
            newId = this.lastID;
        });
        if(newId != -1){
            result = true;
            this.#id.value = newId;
        }

        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     */
    SelectRows(db, vals){
        let result = [];
        db.all(this.#selectCommand(vals), vals.map(e =>e.value), (err, rows)=>{
            if(err) throw err.message;
            result = rows;
        });
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     * @param {BaseVar[]} vals
     */
    SelectRow(db, vals){
        db.all(
            this.#selectCommand(vals), 
            vals.map(e =>e.value), 
            (err, rows)=>{
                if(err) throw err.message;
                rows.forEach(row =>{
                    this.#updateObject(this.GetList(), row);
                })
            }
        )
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
                }
            );
        return result;
    }

    /**
     * @param {sqlite3.Database} db
     */
    CreateTable(db){
        let comStr = this.#createTableCommand(this.GetList());
        db.exec(comStr, (err)=>{
            if(err) {throw err?.message}
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
    }


    /* #region  Create Command */
    /**
     * @param {BaseVar} comparedVal
     */
    #deleteRowCommand(comparedVal) {
        return `DELETE FROM ${this.#tableName} WHERE ${comparedVal.getEqualQuestion()}`;
    }


    /**
     * @param {BaseVar[]} vals
     * @param {BaseVar} comparedVar
     */
    #updateRowCommand(vals, comparedVar) {
        return `UPDATE ${this.#tableName} SET ${this.#createUpdateEqualString(vals)} WHERE ${comparedVar.getEqualQuestion()}`;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #insertCommand(vals) {
        if (vals.length == 0) return "";
        return `INSERT INTO ${this.tableName} (${this.#getInsertValue(vals)}) VALUES ?`;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #selectCommand(vals){
        if(vals.length == 0) return "";
        return `SELECT * FROM ${this.tableName} WHERE ${this.#createEqualString(vals)}`;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #createTableCommand(vals) {
        let creaStr = this.#createTableVals(vals);
        return `CREATE TABLE IF NOT EXISTS ${this.tableName}(${creaStr})`;
    }

    #deleteTableCommand() {
        return `DROP TABLE IF EXISTS ${this.tableName}`;
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
            return stringFinal + primaryKey + " , " + foreignRef;
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
     * WRONG HERE, DONT NEED IT
     * @param {BaseVar[]} vals
     */
    #getInsertQuestion(vals) {
        let str = "";
        return vals.map(val => val.name).join(' , ');
    }
    /* #endregion */
}
