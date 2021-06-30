
const { app,dialog } = require('electron').remote;
var macaddress = require('macaddress');

window.$ = window.jQuery = require('./public/js/jquery.min.js');
let serialport = require('serialport');

const Readline =  require('@serialport/parser-readline'); 
const ByteLength = serialport.parsers.ByteLength;
const fs2 = require('fs');

let hexparser1 =new ByteLength({ length: 1});
let strData = "";
let stringparser1 = new Readline();

var CryptoJS = require("crypto-js");      
// console.log(getmac.toLowerCase().replace(/-/g,":"));
macaddress.one((err,mac)=>{
  $('#appID').append(mac);
});