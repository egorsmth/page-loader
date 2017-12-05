import fs from 'fs'
import https from 'https'
import cheerio from 'cheerio'

const getPageContent = (url, cb) => {
    https.get(url, (resp) => {
        let data = '';
               resp.on('data', (chunk) => {
          data += chunk;
        });
        resp.on('end', () => {
            cb(null, data)
        });
      }).on("error", (err) => {
        cb(err.message, null)
      });
}

const getDownloadableLinks = (content) => {
    let urls = []
    const html = cheerio.load(content)
    const links = [...html('link')]
    const imgs = [...html('img')]

    const total = [...links, ...imgs]
    return total.reduce((prev, curr) => {
        if (curr.name == 'link') {
            return [...prev, curr.attribs.src]
        }
        return [...prev, curr.attribs.href]
    }, [])
}
export { getPageContent, getDownloadableLinks }