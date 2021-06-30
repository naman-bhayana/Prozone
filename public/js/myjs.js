const { app,dialog } = require('electron').remote
var moment = require('moment');
window.$ = window.jQuery = require('../js/jquery.min.js');
let serialport = require('serialport');
const Readline =  require('@serialport/parser-readline')
const ByteLength = serialport.parsers.ByteLength;
const fs = require('fs');
const fs2 = require('fs');
let hexparserSmoke =new ByteLength({ length: 1});
let hexparserGas =new ByteLength({ length: 25});

console.log(parseInt('0E',16));

const date = moment();
let testDate = date.format("DD-MM-YYYY");
let testTime = date.format("HH:mm");

console.log(testDate);
//write test files if not found

fs.readFile('gas_test.json',(err,data)=>{
  if (err) {
    let testGasData={
      "PUC_Test":"CP100/Gas_tController.puc_data",
      CO:"1.23",
      HC:"6666",
      CO2:"12.12",
      O2:"12.12",
      RPM:"6666",
      Lambda_CO:"1.23",
      Lambda:"0.987",
      Date:testDate,
      Time:testTime,
      Reserve:"8",
      Status:"OK",
      "PUC_Test_End":"CP100/Gas_tController.puc_data"
    };

    let jsonContent = JSON.stringify(testGasData);

    fs.writeFile("gas.json",jsonContent,'utf8',(err)=>{
      console.log(testGasData);
      if(err){
        console.log(err)
      }else{
        console.log("File has been save for the gas test");
      }
    });
  }
  else{
    console.log("gas test file found");
  }
}); //end readFile gas_test.json 

fs.readFile('smoke_test.json',(err,data)=>{
  if (err) {

   let testSmokeData ={
    "PUC_Test":"CP100/Smoke_tController.puc_data",
     Flush_Cyl:"#PT;100;5000;60;",
     Status:"OK",
     Test1:"TR03;0.63;800;5000;60",
     Test2:"TR03;0.63;800;5000;60",
     Test3:"TR03;0.63;800;5000;60",
     Test_AVG:"#TA;0.63",
     Date:testDate,
     Time:testTime,
     Test_Status:"#TS0",
     "PUC_Test_End":"CP100/Smoke_tController.puc_data"
   }
   let jsonContent = JSON.stringify(testSmokeData);

    fs.writeFile("smoke.json",jsonContent,'utf8',(err)=>{
      console.log(testSmokeData);
        if(err){
            console.log("File not saved for smoke test");
        }else{
            console.log("File saved for smoke test");
        }
    }); //end writeFile smoke_test.json 
  }
  else{
    console.log("smoke test file found");
  }
});//end readFile smoke_test.json 



let port = null;

serialport.list((err, ports) => {
  console.log("serialport list");
  console.log(ports.length);
  if(ports.length>0){
    for (let item of ports) {
      $('.com').append(`<option>${item.comName}</option>`)
    }
    console.log(ports);    
  }
  if(err){
    app.showExitPrompt = true
    if (app.showExitPrompt) {
      
      dialog.showMessageBox({
          type: 'question',
          buttons: ['OK'],
          title: 'Alert',
          message: 'No Comport Found'
      }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
              app.showExitPrompt = false
              
          }
      })
    }
  }
});


$('.btn-submit').click((data) => {

  console.log('submit button clicked');
  let COM = $('#disabledSelect :selected').text();
  let testType =$('#selectTestType :selected').text();
  // console.log(testType);
  let BaudRate = $('#BaudRate').val();
  let buttonName=$('.btn-submit').text();

  if( testType==='Select Test Type')
  {
    app.showExitPrompt = true
    if (app.showExitPrompt) 
    {
      dialog.showMessageBox({
          type: 'question',
          buttons: ['OK'],
          title: 'Alert',
          message: 'Please Select Test type'
      }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
            app.showExitPrompt = false
          }
      })
    }
  }
  else if(COM==='')
  {
    app.showExitPrompt = true
    if (app.showExitPrompt) 
    {
        dialog.showMessageBox({
            type: 'question',
            buttons: ['OK'],
            title: 'Alert',
            message: 'There is no com port selected'
        }, function (response) {
            if (response === 0) { // Runs the following if 'Yes' is clicked
                app.showExitPrompt = false
                
            }
        })
    }
  }
  else if(buttonName==='Connect')
  {   
    port = new serialport(COM, {
      baudRate: parseInt(BaudRate)
    });

    port.on('open',()=>{
      $('.btn-submit').html("Disconnect");
    });

    port.on('error',(err)=>{
      app.showExitPrompt = true
      if (app.showExitPrompt) {
      
        dialog.showMessageBox({
            type: 'question',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Could not open the port'
        }, function (response) {
            if (response === 0) { // Runs the following if 'Yes' is clicked
                app.showExitPrompt = false
                
            }
        })
      }
    });
      
    $('.receive-windows').text(`Open serial port: ${COM}, Baud rate: ${BaudRate}`);
    $('.receive-windows').append('<br/>=======================================<br/>');


    if(testType==='Smoke')
    {
      port.pipe(hexparserSmoke);
      try
      {
        var count=0;
            
        port.on('data',data =>{
          console.log(data.length);
        });//end port on data

        hexparserSmoke.on('data', (data) => { 
                              
          if(data.length<51)
          {
            console.log("data length = "+data.length);
            strData = strData.concat(data.toString('hex'));
            let star = (strData[0].concat(strData[1])).toUpperCase();
            if(star!="2A")
            {
              strData="";
              return;
            }
            if(strData.length==20)
            {
              $("#data1").removeClass('data1');
              $("#data1").addClass('data');
              
              let Z = (strData[2].concat(strData[3])).toUpperCase();
              let Dollar = (strData[18].concat(strData[19])).toUpperCase();

              if(star =="2A" && Z=="5A" && Dollar=="24")
              {
                console.log("Flush cycle is correct");
              }
              else
              {
                console.log("Incorrect Flush cycle   ="+strData);
                return;
              }

            }
            if(strData.length==102)
            {
              $("#data2").removeClass('data1');
              $("#data2").addClass('data');
              let star = (strData[20].concat(strData[21])).toUpperCase();
              let E = (strData[22].concat(strData[23])).toUpperCase();
              let Dollar = (strData[100].concat(strData[101])).toUpperCase();
              if(star=="2A" && E=="45" && Dollar=="24")
              {
                console.log("Measurment cycle is correct");
              }
              else
              {
                console.log("Wrong Measurment cycle");
                console.log(strData);
                $('.receive-windows').text("Inappropriate Data Received");
                $('#data1').removeClass("data");
                 $("#data2").removeClass('data');
                $("#data1").addClass('data1');
                $("#data2").addClass('data1');
                strData = ""; 
                return;
              }
              console.log(strData);

              
              let idealrpmmax = strToHex(4).toString();
              let maxrpmavg = strToHex(8).toString();
              let avgoiltemp = strToHex(12).toString();

              let checksum1 = strToHex2(16).toString();

              let c1k = (strToHex(24)/100).toString();
              let c1hsu = (strToHex(28)/10).toString();
              let c1idealrpm = strToHex(32).toString();
              let c1maxrpm = strToHex(36).toString();
              let c1oil = strToHex(40).toString();

              let c2k = (strToHex(44)/100).toString();
              let c2hsu = (strToHex(48)/10).toString();
              let c2idealrpm = strToHex(52).toString();
              let c2maxrpm = strToHex(56).toString();
              let c2oil = strToHex(60).toString();

              let c3k = (strToHex(64)/100).toString();
              let c3hsu = (strToHex(68)/10).toString();
              let c3idealrpm = strToHex(72).toString();
              let c3maxrpm = strToHex(76).toString();
              let c3oil = strToHex(80).toString();

              let avgk = strToHex(84).toString();
              let avghsu = strToHex(88).toString();

              let teststatus = strToHex2(92).toString();
              let checksum2 = strToHex2(98).toString();

              const date = moment();
              let todayDate = date.format("DD-MM-YYYY");
              let time = date.format("HH:mm");
              console.log(todayDate+"  time"+time);

              // let machineData={
              //     Idealrpmmax:idealrpmmax.toString(),
              //     Maxrpmavg:maxrpmavg.toString(),
              //     Avgoiltemp:avgoiltemp.toString(),
              //     C1k:c1k.toString(),
              //     C1hsu:c1hsu.toString(),
              //     C1idealrpm:c1idealrpm.toString(),
              //     C1maxrpm:c1maxrpm.toString(),
              //     C1oil:c1oil.toString(),
              //     C2k:c2k.toString(),
              //     C2hsu:c2hsu.toString(),
              //     C2idealrpm:c2idealrpm.toString(),
              //     C2maxrpm:c2maxrpm.toString(),
              //     C2oil:c2oil.toString(),
              //     C3k:c3k.toString(),
              //     C3hsu:c3hsu.toString(),
              //     C3idealrpm:c3idealrpm.toString(),
              //     C3maxrpm:c3maxrpm.toString(),
              //     C3oil:c3oil.toString(),
              //     Time:time.toString(),
              //     Reserve:"8",
              //     Status:"OK"
              // };

              let machineData={
                 PUC_Test:"CP100/Smoke_tController.puc_data",
                 Flush_Cyl:"#PT;"+idealrpmmax+";"+maxrpmavg+";"+avgoiltemp+";",
                 Status:"OK",
                 Test1:"TR01;"+c1k+";"+c1idealrpm+";"+c1maxrpm+";"+c1oil,
                 Test2:"TR02;"+c2k+";"+c2idealrpm+";"+c2maxrpm+";"+c2oil,
                 Test3:"TR03;"+c3k+";"+c3idealrpm+";"+c3maxrpm+";"+c3oil,
                 Test_AVG:"#TA;"+avgk,
                 Date:todayDate.toString(),
                 Time:time.toString(),
                 Test_Status:"#TS0",
                 PUC_Test_End:"CP100/Smoke_tController.puc_data"
              };

              let jsonContent = JSON.stringify(machineData);

              fs2.writeFile("smoke.json",jsonContent,'utf8',(err)=>{
                if(err){}
                else
                {
                  console.log("File has been saved");
                  $('.receive-windows').text(jsonContent);     
                }
              });
              
              strData="";

              setTimeout(function() {
                 $('#data1').removeClass("data");
                 $("#data2").removeClass('data');
                 $("#data1").addClass('data1');
                 $("#data2").addClass('data1');
                }, 1000);

              function strToHex2(a1)
              {
                return parseInt("0x".concat(strData[a1].concat(strData[a1+1])));
              }

              function strToHex(a1)
              {
                  let HB = parseInt("0x".concat(strData[a1].concat(strData[a1+1])));
                  let LB = parseInt("0x".concat(strData[a1+2].concat(strData[a1+3])));
                  let res = HB*256+LB;
                  return res;
              }
            }//end if strData.length = 102

            if(strData.length>102)
            {
              strData="";
               $('.receive-windows').text("Inappropriate Data Received");
               $("#data1").addClass('data1');
               $("#data2").addClass('data1');
            }

          }//end if data.lenth<51
          
          data=null;
          
        });//end hexparserSmoke
      }
      catch(err)
      {
        console.log(err);
      }
    }//end testType =Smoke
    else if(testType==='Gas')
    {
      port.pipe(hexparserGas);
      try
      {
        hexparserGas.on('data', data => {
          // console.log(data.toString('hex'));
          if(data.length===25 || data.length===24)
          {
            // console.log("correct length");
            if(data[0]===0x10 && data[1]===0x02)
            {
              // console.log("correct Start");
              if(data[data.length-2]===0x10 && data[data.length-1]===0x03)
              {
                console.log("correct End");
              let  co2_1= ((parseInt(data[2].toString())*256+ parseInt(data[3].toString()))/100).toFixed(3);
         
              let co_1 = ((parseInt(data[4].toString())*256+parseInt(data[5].toString()))/100).toFixed(2);

              let hc_1 =( (parseInt(data[8].toString())*256 + parseInt(data[9].toString()))/100).toFixed(2);

              let o2_1 =( (parseInt(data[10].toString())*256 + parseInt(data[11].toString()))/100).toFixed(2);

              let pef1 = ( (parseInt(data[12].toString())*256 +  parseInt(data[13].toString()))/1000).toFixed(3);
            
              let rpm1 = (parseInt(data[14].toString())*256 + parseInt(data[15].toString()));
             
              let lambda1 =( (parseInt(data[16].toString())*256+ parseInt(data[17].toString()))/1000).toFixed(3);
        
              let fueltype = parseInt(data[18].toString());

              let systembit_1 = parseInt(data[19].toString());
              let systembit_2 = parseInt(data[20].toString());
              let tic = parseInt(data[21].toString());
              let checksum = parseInt(data[22].toString());
              // rawDataIntoString='';
              
              const date = moment();
              let todayDate = date.format("DD-MM-YYYY");
              let time = date.format("HH:mm");
              console.log(todayDate+"  time"+time);

              let machineData={
                  "PUC_Test":"CP100/Gas_tController.puc_data",
                  CO:co_1.toString(),
                  HC:hc_1.toString(),
                  CO2:co2_1.toString(),
                  O2:o2_1.toString(),
                  RPM:rpm1.toString(),
                  Lambda_CO:co_1.toString(),
                  Lambda:lambda1.toString(),
                  Date:todayDate.toString(),
                  Time:time.toString(),
                  Reserve:"8",
                  Status:"OK",
                  "PUC_Test_End":"CP100/Gas_tController.puc_data"
              };

              let jsonContent = JSON.stringify(machineData);
              fs2.writeFile("gas.json",jsonContent,'utf8',(err)=>{
                  if(err){

                  }else{
                      console.log("File has been save");
                      $('.receive-windows').text(jsonContent.replace(/,/g,"\n"));
                      
                  }
              });
            }
          }
          } // end datalenght = 25 ||24
              
          data=null;
          try
          {
            port.flush();
          }
          catch(err)
          {
              console.log(err);
          }
         
        });
      }
      catch(err){
        console.log(err);
      }
    }//end testype=Gas
  }//end buttonName = Connect

  else if(buttonName==='Disconnect'){
    app.showExitPrompt = true
    if (app.showExitPrompt) {
      dialog.showMessageBox({
          type: 'question',
          buttons: ['OK','NO'],
          title: 'Alert',
          message: 'Port is going to close. You may loose data'
      }, function (response) {
          if (response === 0) { // Runs the following if 'Yes' is clicked
              app.showExitPrompt = false
              port.close(err=> {
                console.log('port closed', err);
                $('.btn-submit').html("Connect");
        });
      }
    })
  }   
  }
});



//scan button
$('.btn-scan').click(()=>{
  serialport.list((err, ports) => {
    $(disabledSelect).empty();

    if(err){
      app.showExitPrompt = true
        if (app.showExitPrompt) {
        
        dialog.showMessageBox({
            type: 'question',
            buttons: ['OK'],
            title: 'Alert',
            message: 'No Comport Found'
        }, function (response) {
            if (response === 0) { // Runs the following if 'Yes' is clicked
                app.showExitPrompt = false
                
            }
        })
      }
    }
    else if(ports.length>0)
    {
    for (let item of ports) 
    {
      $('.com').append(`<option>${item.comName}</option>`)
    }
    console.log(ports);
    }
  });
})

// Click to send the message
$('.btn-send').click(() => {
    var sendData = $('.input-send-data').val();
    if (port != {} && port != null) {
        console.log(`SendData: ${sendData}`);
        port.write(sendData);
    }
})

// clear the message
$('.btn-reset').click(() => {
    $('.input-send-data').val('');
})
//

