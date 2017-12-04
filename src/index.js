import fs from 'fs'
import https from 'https'
global.XMLHttpRequest = require('xmlhttprequest').XMLHttpRequest

export default (url, out='/tmp') => {
    const content = getPageContent(url)
    
}

const getPageContent = (url) => {
    https.get(url, (resp) => {
        let data = '';
       
        // A chunk of data has been recieved.
        resp.on('data', (chunk) => {
          data += chunk;
        });
       
        // The whole response has been received. Print out the result.
        resp.on('end', () => {
          console.log(data);
        });
       
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
}
const save = (data, dest, cb) => {
    fs.WriteFile(dest, data, cb)
}

const getDownloadableLinks = (content) => {
    console.log("======CONTENT=======")
    console.log(content)
    console.log("======CONTENT=======")
}