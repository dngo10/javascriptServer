import {BaseModel} from "./base_model/base_model.js";
import { Kw } from "./ultility/sqlite3_keywords.js";
import {BaseVar} from "./variable/base_variable.js";
import { v4 as uuidv4 } from 'uuid';

export class RecordTable extends BaseModel{
    #dataString = new BaseVar("data_string", "",);
    #uuid = new BaseVar("UUID", uuidv4());

    get uuid(){return this.#uuid}
    set uuid(value){
        if(!value) throw 'Not a valid type';
        if(typeof value.value == 'string'){
            this.#uuid.value = value.value;
        }else{
            throw 'uuid is not a valid type';
        }
    }

    get dataString(){return this.#dataString};
    set dataString(value){
        if(!value) throw 'Not a valid type';
        if(typeof value.value == 'string'){
            this.#dataString.value = value.value;
        }else{
            throw 'dataString not a valid type';
        }
    }

    /**
     * @override
     */
    GetList(){return [this.id, this.uuid, this.dataString];}

    /**
     * @override
     */
    GetListNoId(){return [this.uuid, this.dataString];}

    constructor(){
        super();
        this.tableName = "RECORD_DATA";
    }
}