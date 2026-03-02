const express = require('express');
const app = express();
const fs = require('fs');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

// Strip PUC_Test and PUC_Test_End so API response starts from CO and ends at OK
function stripPucWrapper(obj) {
  var o = Object.assign({}, obj);
  delete o.PUC_Test;
  delete o.PUC_Test_End;
  return o;
}

// API mapping: Zone1 = gas live, Zone1_t = gas test, Zone2 = smoke live, Zone2_t = smoke test
//gas value (Multi Gas Analyzer - live)
app.get('/api/PROZONE/Zone1/',(req,res)=>{
   
 
    // read file sample.json file
    fs.readFile('gas.json',
        // callback function that is called when reading file is done
        function(err, data) { 

            if(err){
                return res.status(400).json(err);
            }
            // json data
            var jsonData = data;
     
            // parse json
            var jsonParsed = JSON.parse(jsonData);
     
           res.send(stripPucWrapper(jsonParsed));
    });

});
//gas test
app.get('/api/PROZONE/Zone1_t/',(req,res)=>{

    // read file sample.json file
    fs.readFile('gas_test.json',
        // callback function that is called when reading file is done
        function(err, data) { 

            if(err){
                return res.status(400).json(err);
            }
            // json data
            var jsonData = data;
     
            // parse json
            var jsonParsed = JSON.parse(jsonData);
     
           res.send(stripPucWrapper(jsonParsed));
    });
});

app.get('/api/PROZONE/Zone2/',(req,res)=>{
     // read file sample.json file
     fs.readFile('smoke.json',
     // callback function that is called when reading file is done
     function(err, data) { 

         if(err){
             return res.status(400).json(err);
         }
         // json data
         var jsonData = data;
  
         // parse json
         var jsonParsed = JSON.parse(jsonData);
  
        res.send(stripPucWrapper(jsonParsed));
    });
});

app.get('/api/PROZONE/Zone2_t/',(req,res)=>{

    // read file sample.json file
     fs.readFile('smoke_test.json',
     // callback function that is called when reading file is done
     function(err, data) { 

         if(err){
             return res.status(400).json(err);
         }
         // json data
         var jsonData = data;
  
         // parse json
         var jsonParsed = JSON.parse(jsonData);
  
        res.send(stripPucWrapper(jsonParsed));
    });
});



const port = 8585;

app.listen(port, () => console.log(`server running on port ${port}`));
