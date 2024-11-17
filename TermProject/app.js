const express = require('express');
const PORT = 3000;
const app = express()
app.listen(PORT, (error)=>{
    if(!error)
        console.log('Connected on port '+PORT)
    else
    console.log("Express Connection failed", error);
});