const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
var nodemailer = require('nodemailer');
const crypto = require('crypto');
const https = require('https');
var ejs = require('ejs');
var pdf = require('html-pdf')

module.exports = {
    test: function () {
        const status = {
            "Status": "Running"
        };

        return status;
    },

    sendMessage: async function (msg_tmplt_id,mobile,param) {
        //Send Message
        let rawdata = fs.readFileSync('messageTemplate.json');
        let templates= JSON.parse(rawdata);
        var msg = ""
        var contents = ""
        var templateid = ""
        var i = 0;
        var returnMssage ={}
        
        templates.templ.forEach(function(tmpl) {
            if(tmpl.id == msg_tmplt_id){
                msg = tmpl.message
                templateid = tmpl.templateid
            }
        });

        contents = msg.replace(/\?/g,function(){return param[i++]})

        //Call Message-Gateway
        var bodyFormData = new FormData();
        bodyFormData.append('mobile', mobile);
        bodyFormData.append('message', contents);
        bodyFormData.append('templateid', templateid);
        bodyFormData.append('extra', '');
        bodyFormData.append('passkey', 'sms_ptax_999666_$#');

        let config = {
        method: 'post',
        url: 'https://barta.wb.gov.in/send_sms_ptax.php',
        headers: {
            "Content-Type": "multipart/form-data",
            "Connection" : "keep-alive"
        },
        data : bodyFormData,
        httpsAgent: new https.Agent({
            secureOptions: crypto.constants.SSL_OP_LEGACY_SERVER_CONNECT,
          })
        };

        let a = await axios.request(config)
        .then((response) => {
            returnMssage = {
                "code":200,
                "message": "Message Sent"
            };
        })
        .catch((error) => {
            console.log(error)
            returnMssage = {
                "code":500,
                "message": "Sending Failed"
            };
        });
        
        return returnMssage;
    },

    sendMail: async function (mail_tmplt_id,sub_param,txt_param,mail) {
        //Send Message
        let rawdata = fs.readFileSync('mailTemplate.json');
        let templates= JSON.parse(rawdata);
        var body = ""
        var subject = ""
        var i = 0;
        var j = 0;
        var returnMssage ={}
        
        templates.templ.forEach(function(tmpl) {
            if(tmpl.id == mail_tmplt_id){
                subject = tmpl.subject
                body = tmpl.text
            }
        });

        subject = subject.replace(/\?/g,function(){return sub_param[i++]})
        body = body.replace(/\?/g,function(){return txt_param[j++]})
        console.log(body)
            //Call Mail-Gateway
            var status = await send(mail, subject, body)

            if (status){
                returnMssage = {
                    "code":200,
                    "message": "Mail Sent"
                };
            }
            else{
                returnMssage = {
                    "code":500,
                    "message": "Sending Failed"
                };
            }
        console.log(returnMssage)
        return returnMssage;
    },

    sendPdf: async function (request) {
        let rawdata = fs.readFileSync('pdfTemplate.json');
        let templates= JSON.parse(rawdata);
        var path = ""

        templates.templ.forEach(function(tmpl) {
            if(tmpl.id == request.pdf_tmplt_id){
                path = tmpl.path
            }
        });
        console.log(request.data)
        var compiled = ejs.compile(fs.readFileSync(path, 'utf8'));
        var html = compiled(request.data);
        var data = await returnHtmlAsPdf(html);
        return data
    }
};

async function send(mail, subject, body){
    return new Promise((resolve,reject)=>{
        let transporter = nodemailer.createTransport({
            host: '10.1.32.59',
            port: 25,
            secure: false, // use SSL
            auth: {
            user: 'wbptax@wb.gov.in',
            pass: 'Taxp@2024',
            }
        });
       var mailOptions = {
            from: 'wbptax@wb.gov.in',
            to: mail,
            subject: subject,
            text: body
       };
       let resp=false;
       
       transporter.sendMail(mailOptions, function(error, info){
           if (error) {
                console.log("Inside Error")
                returnMssage = {
                    "code":500,
                    "message": "Sending Failed"
                };
                resolve(false);
           } 
          else {
                console.log("Inside Success")
                returnMssage = {
                    "code":200,
                    "message": "Mail Sent"
                };
                resolve(true);
           }
          });
        })
       }

       async function returnHtmlAsPdf(html) {
        return new Promise((resolve, reject) => {
            pdf.create(html).toStream(function(err, buffer){
                if(err){
                    resolve(null);
                }
                resolve(buffer);
            })

            pdf.create(html).toFile('./result.pdf',() => {
                console.log('pdf done')
            })
        });
    
    }