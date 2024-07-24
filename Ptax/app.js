var service = require('./service');
const express = require('express');
const app = express ();
app.use(express.json());
var fs = require('fs');
var ejs = require('ejs');
var pdf = require('html-pdf')

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log("Server Listening on PORT:", port);
  });

app.get("/status", (request, response) => {
    rersult = service.test()
    response.send(rersult);
 });

app.post("/msg", async (req, res, next) => {
    rersult = await service.sendMessage(req.body.msg_tmplt_id,req.body.mobile,req.body.param)
    
    res.status(200).json(rersult);
   });

app.post("/mail", async (req, res, next) => {
    rersult = await service.sendMail(req.body.mail_tmplt_id,req.body.sub_param,req.body.txt_param,req.body.mail)
    
    res.status(200).json(rersult);
   });

   app.post("/pdf", async (req, res, next) => {
    rersult = await service.sendPdf(req.body)

    rersult.pipe(res);
   });