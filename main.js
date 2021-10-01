import express from 'express';
import { App } from './src/app.js';

export class Main{
    #app =express();
    #port = 3000;
    #mainApp = new App();

    constructor(){
        this.#app.get('/', (req, res) =>{
            res.send('Hello World');
        });

        this.#app.listen(this.#port, ()=>{
            console.log(`listening at http://localhost:${this.#port}`);
        })
    }
}

const main = new Main();