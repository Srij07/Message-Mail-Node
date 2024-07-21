const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
var nodemailer = require('nodemailer');

module.exports = {
    test: function () {
        const status = {
            "Status": "Running"
        };

        return status;
    },

    sendMessage: async function (request) {
        //Send Message
        let rawdata = fs.readFileSync('messageTemplate.json');
        let templates= JSON.parse(rawdata);
        var msg = ""
        var contents = ""
        var id = request.msg_tmplt_id
        var i = 0;
        var returnMssage ={}
        
        templates.templ.forEach(function(tmpl) {
            if(tmpl.id == id){
                msg = tmpl.message
            }
        });

        contents = msg.replace(/\?/g,function(){return request.param[i++]})

        //Call Message-Gateway
        let data = new FormData();
        data.append('mobile', request.mobile);
        data.append('message', contents);
        data.append('templateid', '1407165881850786099');
        data.append('extra', '');
        data.append('passkey', 'sms_ptax_999666_$#');

        let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: 'https://barta.wb.gov.in/send_sms_ptax.php',
        headers: { 
            ...data.getHeaders()
        },
        data : data
        };

        let a = await axios.request(config)
        .then((response) => {
            returnMssage = {
                "code":200,
                "message": "Message Sent"
            };
        })
        .catch((error) => {
            returnMssage = {
                "code":500,
                "message": "Sending Failed"
            };
        });
        
        return returnMssage;
    },

    sendMail: async function (request) {
        //Send Message
        let rawdata = fs.readFileSync('mailTemplate.json');
        let templates= JSON.parse(rawdata);
        var body = ""
        var subject = ""
        var id = request.mail_tmplt_id
        var i = 0;
        var j = 0;
        var returnMssage ={}
        
        templates.templ.forEach(function(tmpl) {
            if(tmpl.id == id){
                subject = tmpl.subject
                body = tmpl.text
            }
        });

        subject = subject.replace(/\?/g,function(){return request.sub_param[i++]})
        body = body.replace(/\?/g,function(){return request.txt_param[j++]})
        console.log(body)
            //Call Mail-Gateway
            var status = await send(request.mail, subject, body)

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