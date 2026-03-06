const { app,dialog } = require('electron').remote
var moment = require('moment');
window.$ = window.jQuery = require('../js/jquery.min.js');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const { ByteLengthParser } = require('@serialport/parser-byte-length');
const fs = require('fs');
const fs2 = require('fs');
let hexparserSmoke = new ByteLengthParser({ length: 1});
let hexparserGas = new ByteLengthParser({ length: 25});

console.log(parseInt('0E',16));

const date = moment();
let testDate = date.format("DD-MM-YYYY");
let testTime = date.format("HH:mm");

console.log(testDate);
//write test files if not found

fs.readFile('gas_test.json',(err,data)=>{
  if (err) {
    let testGasData={
      "PUC_Test":"PROZONE/zone1_tController.puc_data",
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
      "PUC_Test_End":"PROZONE/zone1_tController.puc_data"
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
    fs.readFile('gas_test.json','utf8',(err,data)=>{
      if (!err && data) fs.writeFile("gas.json", data, 'utf8', (e)=>{ if (!e) console.log("gas.json initialized from gas_test.json"); });
    });
  }
}); //end readFile gas_test.json 

fs.readFile('smoke_test.json',(err,data)=>{
  if (err) {

   let testSmokeData ={
    "PUC_Test":"PROZONE/zone2_tController.puc_data",
     Flush_Cyl:"#PT;100;5000;60;",
     Status:"OK",
     Test1:"TR03;0.63;800;5000;60",
     Test2:"TR03;0.63;800;5000;60",
     Test3:"TR03;0.63;800;5000;60",
     Test_AVG:"#TA;0.63",
     Date:testDate,
     Time:testTime,
     Test_Status:"#TS0",
     "PUC_Test_End":"PROZONE/zone2_tController.puc_data"
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
    fs.readFile('smoke_test.json','utf8',(err,data)=>{
      if (!err && data) fs.writeFile("smoke.json", data, 'utf8', (e)=>{ if (!e) console.log("smoke.json initialized from smoke_test.json"); });
    });
  }
});//end readFile smoke_test.json 



let strData = "";
let port = null;

function decodeSmokeFrame(frame) {
  // Smoke Meter Zone-02 frame (Prozone_HEX_data.pdf) is 53 bytes:
  // Start: 2D 68, End: 40 24
  if (!frame || frame.length !== 53) return null;
  if (frame[0] !== 0x2D || frame[1] !== 0x68) return null;
  if (frame[51] !== 0x40 || frame[52] !== 0x24) return null;

  function u16be(i) {
    if (i < 0 || i + 1 >= frame.length) return 0;
    return frame[i] * 256 + frame[i + 1];
  }

  // Flush cycle averages (bytes 3..8 in the PDF)
  const flushMinRpmAvg = u16be(2).toString();
  const flushMaxRpmAvg = u16be(4).toString();
  const oilTempAvg = u16be(6).toString();

  // Test cycles (all are 16-bit BE values; scaling taken from existing code conventions)
  const c1k = (u16be(13) / 100).toString();
  const c1minRpm = u16be(17).toString();
  const c1maxRpm = u16be(19).toString();
  const c1oil = u16be(21).toString();

  const c2k = (u16be(23) / 100).toString();
  const c2minRpm = u16be(27).toString();
  const c2maxRpm = u16be(29).toString();
  const c2oil = u16be(31).toString();

  const c3k = (u16be(33) / 100).toString();
  const c3minRpm = u16be(37).toString();
  const c3maxRpm = u16be(39).toString();
  const c3oil = u16be(41).toString();

  const avgk = (u16be(43) / 100).toString();

  const date = moment();
  const todayDate = date.format("DD-MM-YYYY");
  const time = date.format("HH:mm");

  return {
    PUC_Test: "PROZONE/zone2_tController.puc_data",
    Flush_Cyl: "#PT;" + flushMinRpmAvg + ";" + flushMaxRpmAvg + ";" + oilTempAvg + ";",
    Status: "OK",
    Test1: "TR01;" + c1k + ";" + c1minRpm + ";" + c1maxRpm + ";" + c1oil,
    Test2: "TR02;" + c2k + ";" + c2minRpm + ";" + c2maxRpm + ";" + c2oil,
    Test3: "TR03;" + c3k + ";" + c3minRpm + ";" + c3maxRpm + ";" + c3oil,
    Test_AVG: "#TA;" + avgk,
    Date: todayDate.toString(),
    Time: time.toString(),
    Test_Status: "#TS0",
    PUC_Test_End: "PROZONE/zone2_tController.puc_data"
  };
}

function formatGasDisplay(obj) {
  var lines = [
    "CO: " + (obj.CO != null ? obj.CO : ""),
    "HC: " + (obj.HC != null ? obj.HC : ""),
    "CO2: " + (obj.CO2 != null ? obj.CO2 : ""),
    "O2: " + (obj.O2 != null ? obj.O2 : ""),
    "RPM: " + (obj.RPM != null ? obj.RPM : ""),
    "Lambda: " + (obj.Lambda != null ? obj.Lambda : "")
  ];
  return lines.join("\n");
}

function formatSmokeDisplay(obj) {
  var display = Object.assign({}, obj);
  delete display.PUC_Test;
  delete display.PUC_Test_End;
  return JSON.stringify(display);
}

SerialPort.list().then(ports => {
  console.log("serialport list");
  console.log(ports.length);
  if(ports.length>0){
    for (let item of ports) {
      $('.com').append(`<option>${item.path}</option>`)
    }
    console.log(ports);    
  }
}).catch(err => {
  app.showExitPrompt = true
  if (app.showExitPrompt) {
    dialog.showMessageBox({
        type: 'question',
        buttons: ['OK'],
        title: 'Alert',
        message: 'No Comport Found'
    }).then(({ response }) => {
        if (response === 0) {
            app.showExitPrompt = false
        }
    })
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
      }).then(({ response }) => {
          if (response === 0) {
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
        }).then(({ response }) => {
            if (response === 0) {
                app.showExitPrompt = false
            }
        })
    }
  }
  else if(buttonName==='Connect')
  {   

    port = new SerialPort({
      path: COM,
      baudRate: parseInt(BaudRate)
    });

    port.on('open',()=>{
      $('.btn-submit').html("Disconnect");
      $("#selectTestType").prop('disabled', true);
      $("#disabledSelect").prop('disabled', true);
      $("#BaudRate").prop('disabled', true);
      $("#scanBtn").prop('disabled', true);
    });

    port.on('error',(err)=>{
      app.showExitPrompt = true
      if (app.showExitPrompt) {
      
        dialog.showMessageBox({
            type: 'question',
            buttons: ['OK'],
            title: 'Alert',
            message: 'Could not open the port'
        }).then(({ response }) => {
            if (response === 0) {
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
        let smokeBuf = Buffer.alloc(0);
        const startBytes = Buffer.from([0x2D, 0x68]);

        hexparserSmoke.on('data', (b) => {
          smokeBuf = Buffer.concat([smokeBuf, b]);

          // prevent unbounded growth if input is noisy
          if (smokeBuf.length > 4096) smokeBuf = smokeBuf.slice(-256);

          while (smokeBuf.length >= 53) {
            const start = smokeBuf.indexOf(startBytes);
            if (start < 0) {
              smokeBuf = smokeBuf.slice(-1);
              return;
            }
            if (smokeBuf.length - start < 53) {
              if (start > 0) smokeBuf = smokeBuf.slice(start);
              return;
            }

            const frame = smokeBuf.slice(start, start + 53);
            smokeBuf = smokeBuf.slice(start + 53);

            const machineData = decodeSmokeFrame(frame);
            if (!machineData) {
              // resync by sliding 1 byte forward
              smokeBuf = Buffer.concat([frame.slice(1), smokeBuf]);
              continue;
            }

            fs2.writeFile("smoke.json", JSON.stringify(machineData), 'utf8', (err) => {
              if (!err) {
                console.log("File has been saved");
                $('.receive-windows').text(formatSmokeDisplay(machineData));
              }
            });
          }
        });
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
              let  co2_1= ((parseInt(data[2].toString())*256+ parseInt(data[3].toString()))/1000).toFixed(3);
         
              let co_1 = ((parseInt(data[4].toString())*256+parseInt(data[5].toString()))/1000).toFixed(2);

              let hc_1 = parseInt(data[8].toString())*256 + parseInt(data[9].toString());

              let o2_1 =( (parseInt(data[10].toString())*256 + parseInt(data[11].toString()))/100).toFixed(2);

              let pef1 =  (parseInt(data[12].toString())*256 +  parseInt(data[13].toString())).toFixed(3);
            
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
                  "PUC_Test":"PROZONE/zone1_tController.puc_data",
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
                  "PUC_Test_End":"PROZONE/zone1_tController.puc_data"
              };

              let jsonContent = JSON.stringify(machineData);
              fs2.writeFile("gas.json",jsonContent,'utf8',(err)=>{
                  if(err){
                  

                  }else{
                      console.log("File has been save");
                      $('.receive-windows').text(formatGasDisplay(machineData));
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
      }).then(({ response }) => {
          if (response === 0) {
              app.showExitPrompt = false
              port.close(err=> {
                console.log('port closed', err);
                $('.btn-submit').html("Connect");
                $("#selectTestType").prop('disabled', false);
                $("#disabledSelect").prop('disabled', false);
                $("#BaudRate").prop('disabled', false);
                $("#scanBtn").prop('disabled', false);
                $('.receive-windows').text('');
                $('#selectTestType').prop('selectedIndex', 0);
                $('#disabledSelect').empty();
                $('#BaudRate').val('9600');
              });
          }
      })
  }   
  }
});



//scan button
$('.btn-scan').click(()=>{
  SerialPort.list().then(ports => {
    $('#disabledSelect').empty();

    if(ports.length>0)
    {
      for (let item of ports) 
      {
        $('.com').append(`<option>${item.path}</option>`)
      }
      console.log(ports);
    }
  }).catch(err => {
    app.showExitPrompt = true
    if (app.showExitPrompt) {
      dialog.showMessageBox({
          type: 'question',
          buttons: ['OK'],
          title: 'Alert',
          message: 'No Comport Found'
      }).then(({ response }) => {
          if (response === 0) {
              app.showExitPrompt = false
          }
      })
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

