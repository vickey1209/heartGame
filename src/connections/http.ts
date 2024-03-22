const fs = require('fs');
const path = require('path');
const express = require('express');
import { getConfig } from "../config";
const { HTTPS_KEY,  HTTPS_CERT} = getConfig();

import { router } from '../route';
import bodyParser from 'body-parser';
const cors = require('cors');
const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());
app.use(router);

let httpserver : any;
 console.log('HTTPS_KEY ::>>   ', HTTPS_KEY, '    HTTPS_CERT ::>> ', HTTPS_CERT);
 if (fs.existsSync(path.join(__dirname + HTTPS_KEY)) && fs.existsSync(path.join(__dirname + HTTPS_CERT)) ) {
  var httpsOptions = {
    key: fs.readFileSync( path.join(__dirname + HTTPS_KEY) ),
    cert: fs.readFileSync( path.join(__dirname + HTTPS_CERT) ),
  };
   console.log('certificate/Directory exists! :::: start in ::==========>> https');
   httpserver = require("https").createServer(httpsOptions, app);

} else {

  console.log('certificate/Directory exists! :::: start in :: ==========>> http');
  httpserver = require("http").Server(app);
}

export = httpserver;
