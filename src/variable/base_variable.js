import {Kw} from "../ultility/sqlite3_keywords.js";

export class BaseVar{
    #name;
    #value;
    #type;
    #contraint;

    foreignTableName = '';
    foreignID = '';

    /**
     * @param {string} name
     * @param {any} value
     */
    constructor(name, value, constraint =""){
        this.#name =name;
        this.#value = value;
        this.#contraint = constraint;
        this.#type = this.#detectType();
    }

    copy(){
        let newVal;
        if((Object.prototype.toString.call(this.#value) === '[object Date]')){
            let temp = new Date(this.#value);
            newVal = new BaseVar(this.name, temp);
        }else{
            newVal = new BaseVar(this.name, this.#value);
        }
        return newVal;
    }

    getEqualQuestion(){
        return `'${this.#name}' = ? `;
    }

    getCreateString(){
        return `'${this.#name}' ${this.#type} ${this.#contraint}`;
    }

    get constraint(){return this.#contraint};
    get type(){return this.#type;}
    get name() {return this.#name;}
    get value(){return this.#value;}
    set name(value){
        let tempName = value.trim().toUpperCase();
        if(!tempName && !Kw.contains(value)){
            this.#name = value.trim().toUpperCase();
        }
    }

    set value(value){
        if (typeof value === 'string' ||
            typeof value === 'boolean' ||
            typeof value === 'number' ||
            Object.prototype.toString.call(value) === '[object Date]'
        )
        this.#value = value;
    }
    

    
    getForeignKey(){
        if(!this.foreignID || this.foreignID === '') return "";
        return `FOREIGN KEY('${this.#name}') REFERENCES ${this.foreignTableName}('${this.foreignID}') ON DELETE CASCADE ON UPDATE CASCADE`;
    }

    #detectType(){
        if( typeof this.#value === 'string' ){
            return Kw.txt;
        }else if(typeof this.#value === 'boolean'){
            return Kw.inter;
        }else if(Number.isInteger(this.#value)){
            return Kw.inter;
        }else if(typeof this.#value === 'number' && !Number.isInteger(this.#value)){
            return Kw.real;
        }else if(Object.prototype.toString.call(this.#value) === '[object Date]'){
            return Kw.txt;
        }else{
            throw "can't detect type of value";
        }
    }
}