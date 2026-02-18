const express = require('express');
const app = express();
const fs = require('fs');

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'content-type');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  next();
});

//gas value
app.get('/api/PROZONE/zone1/',(req,res)=>{
   
 
    // read file sample.json file
    fs.readFile('gas.json',
        // callback function that is called when reading file is done
        function(err, data) { 

            if(err){
                return res.status(400).json(err);
                PROZONE.log(err);
            }
            // json data
            var jsonData = data;
     
            // parse json
            var jsonParsed = JSON.parse(jsonData);
     
           res.send(jsonParsed);
    });

});
//gas test
app.get('/api/PROZONE/zone1_t/',(req,res)=>{

    // read file sample.json file
    fs.readFile('gas_test.json',
        // callback function that is called when reading file is done
        function(err, data) { 

            if(err){
                return res.status(400).json(err);
                console.log(err);
            }
            // json data
            var jsonData = data;
     
            // parse json
            var jsonParsed = JSON.parse(jsonData);
     
           res.send(jsonParsed);
    });
});

app.get('/api/PROZONE/zone2/',(req,res)=>{
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
  
        res.send(jsonParsed);
    });
});

app.get('/api/PROZONE/zone2_t/',(req,res)=>{

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
  
        res.send(jsonParsed);
    });
});



const port = 8190;

app.listen(port, () => console.log(`server running on port ${port}`));
