var service = require('./service');
const express = require('express');
const app = express ();
app.use(express.json());

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server Listening on PORT:", port);
  });

app.get("/status", (request, response) => {
    rersult = service.test()
    response.send(rersult);
 });

app.post("/msg", async (req, res, next) => {
    rersult = await service.sendMessage(req.body)
    
    res.status(200).json(rersult);
   });

app.post("/mail", async (req, res, next) => {
    rersult = await service.sendMail(req.body)
    
    res.status(200).json(rersult);
   });