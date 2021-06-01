require('dotenv').config()

const https = require('http');

/**
   Function POST: post the data "jdata" to the url "url".
   "f" is the callback when it's finished
*/
function POST(jdata,url,f) {

    const data = JSON.stringify(jdata);

    const options = {
        hostname: process.env.BACKEND_HOST,
        port: process.env.BACKEND_PORT,
        path: url,
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        }
    };

    const req = https.request(options, res => {
        console.log(`statusCode: ${res.statusCode}`);

        res.on('data', (d) => {
            let jd = JSON.parse(d.toString('utf-8'));
            f(jd);
        });
    });

    req.on('error', error => {
        console.error(error);
    });

    req.write(data);
    req.end();
}

function run(login, password, destination_code, message)
{
    /* Doing POST ... Imbricate them*/
    POST({username: login, password: password},"/login",d => {
        console.dir(d);
        data = {
            jwt:d.message, 
            data: {
                temperature: (new Date()).getSeconds()/2,
                location: message},
            dest: destination_code,
        }
        POST(data,"/pushdata",d => {
            console.dir(d);
        });
    });
}

exports.run = run;
