
const { app,dialog } = require('electron').remote;
var macaddress = require('macaddress');

window.$ = window.jQuery = require('./public/js/jquery.min.js');
const { SerialPort } = require('serialport');

const { ReadlineParser } = require('@serialport/parser-readline'); 
const { ByteLengthParser } = require('@serialport/parser-byte-length');
const fs2 = require('fs');

let hexparser1 = new ByteLengthParser({ length: 1});
let strData = "";
let stringparser1 = new ReadlineParser();

var CryptoJS = require("crypto-js");      
// console.log(getmac.toLowerCase().replace(/-/g,":"));
macaddress.one((err,mac)=>{
  $('#appID').append(mac);
});