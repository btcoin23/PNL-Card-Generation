//Importing project dependancies that we installed earlier
import * as dotenv from 'dotenv'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import path from 'path';
//Importing .env validation 
import validateEnv from '@utils/validateEnv'
import { generatePNLImage } from "./core/generate.pnl.img";
import { TestPage } from "./test/index";
//App Varaibles 
dotenv.config()

validateEnv();

//intializing the express app 
const app = express();
//using the dependancies
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.use('/assets/pnl', express.static(path.join(__dirname, 'assets/pnl')));

app.get('/', TestPage);
app.post('/create', generatePNLImage);

//exporting app
module.exports = app