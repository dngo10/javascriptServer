class BaseModel {
    #id = new BaseVar("ID", 0, Kw.primaryKey);
    #tableName = "";

    /**
     * @param {BaseVar} value
     */
    set id(value) { this.#id = value; }
    get id() { return this.#id; }

    /**
     * @param {string} value
     */
    set tableName(value) {
        if (!value && !Kw.contains(value)) {
            this.#tableName = value.trim().toUpperCase();
        }
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
    #selectCommand(vals) {
        if (vals.length == 0) return "";
        return `INSERT INTO ${this.#tableName} (${this.#getInsertValue(vals)}) VALUES ?`;
    }

    /**
     * @param {BaseVar[]} vals
     */
    #createTableCommand(vals) {
        let creaStr = this.#createTableVals(vals);
        return `CREATE TABLE IF NOT EXISTS ${this.#tableName}`;
    }

    #deleteTableCommand() {
        return `DROP TABLE IF EXISTS ${this.#tableName}`;
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
        stringFinal = vals.map(val => val.getCreateString()).join(' , ');
        foreignRef = vals.filter(function (obj) {
            return !obj.foreignTableName && obj.foreignTableName !== "";
        }).map(val => val.getForeignKey()).join(' , ');

        if (foreignRef.length != 0) {
            return stringFinal + " , " + foreignRef;
        } else {
            return stringFinal;
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