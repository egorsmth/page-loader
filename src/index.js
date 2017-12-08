import fs from 'fs'
import https from 'https'
import cheerio from 'cheerio'
import axios from 'axios'

const getPageContent = (url, cb) => {
    https.get(url + '/', (resp) => {
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

const getDownloadableLinks = (html) => {
    let urls = []
    const content = cheerio.load(html)
    const links = [...content('link')]
    const imgs = [...content('img')]

    const total = [...links, ...imgs]
    return total.reduce((prev, curr) => {
        if (curr.name == 'link') {
            return [...prev, curr.attribs.href]
        }
        return [...prev, curr.attribs.src]
    }, [])
}

const downloadAsset = (asset, url, dir, cb) => {
    https.get(url + '/' + asset, (res) => {
        res.on('data', (d) => {
            fs.appendFileSync(dir + asset, d)
            cb()
        });
    }).on('error', (err) => {
        cb(err)
    })
}

const changeLinksToLokal = (html, dir) => {
    const content = cheerio.load(html);
    [...content('link')].map((val) => {
        val.attribs.href = dir + val.attribs.href;
    });
    [...content('img')].map((val) => {
        val.attribs.src = dir + val.attribs.src;
    });
    return content.html()
}

const loadPage = (url, dir, cb) => {
    getPageContent(url, (err, content) => {
        if (err) {
            console.error(err)
        }
        const links = getDownloadableLinks(content)
        links.map((link) => {
            downloadAsset(link, url, dir, (err) => {
                if (err) {
                    console.error('error ' + link + " " + url)
                    console.error(err)
                }
            });
        });
        const updatedLinksContent = changeLinksToLokal(content, dir);
        fs.appendFileSync(dir + 'index.html', updatedLinksContent);
        cb()
    });
}

export { getPageContent, getDownloadableLinks, downloadAsset, changeLinksToLokal, loadPage }