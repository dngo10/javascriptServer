import express from 'express';
import { App } from './src/app.js';

export class Main{
    #app =express();
    #port = 3000;
    #mainApp = new App();

    constructor(){
        let self = this;

        this.#app.get('/', (req, res) =>{
            //this.#mainApp.Temp();
            res.send('Hello World');
        });

        this.#app.get('/a2', function(req, res){
            self.#mainApp.Temp2();
            res.send("get here 2");
            req.ip;
        });

        this.#app.get('/a1', function(req, res){
            self.#mainApp.Temp();
            res.send("get here 1");
            req.ip;
        });

        this.#app.get('/a3', function(req, res){
            self.#mainApp.Temp3();
            res.send("get here 3");
            req.ip;
        });

        this.#app.listen(this.#port, ()=>{
            console.log(`listening at http://localhost:${this.#port}`);
            process.on("beforeExit", ()=>{
                this.#mainApp.sqlCtrl.db.close();
            });
        })
    }
}

new Main();