import fs from 'fs'
import https from 'https'
import cheerio from 'cheerio'
import shell from 'shelljs'
import path from 'path'
import { URL } from 'url'

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
        if (curr.name == 'link' && curr.attribs.href.startsWith('/')) {
            let myURL = curr.attribs.href
            if (curr.attribs.href.indexOf('?') != -1) {
                myURL = curr.attribs.href.substring(0, curr.attribs.href.indexOf('?'));
            }
            return [...prev, myURL]
        } else if (curr.name == 'img' && curr.attribs.src.startsWith('/')) {
            let myURL = curr.attribs.src
            if (curr.attribs.src.indexOf('?') != -1) {
                myURL = curr.attribs.src.substring(0, curr.attribs.src.indexOf('?'));
            }
            return [...prev, myURL]
        } else {
            return prev
        }
    }, [])
}

const downloadAsset = (asset, url, dir, cb) => {
    console.log(asset, url, dir)
    https.get(url + asset, (res) => {
        res.on('data', (d) => {
            try {
                shell.mkdir('-p', path.dirname(dir + asset));
                fs.appendFileSync(dir + asset, d)
                cb()
            } catch (e) {
                cb(e)
            }
        });
    }).on('error', (err) => {
        cb(err)
    })
}

const changeLinksToLokal = (html, dir) => {
    const content = cheerio.load(html);
    [...content('link')].map((curr) => {
        if (curr.name == 'link' && curr.attribs.href.startsWith('/')) {
            curr.attribs.href = dir + curr.attribs.href;
        }
    });
    [...content('img')].map((curr) => {
        if (curr.name == 'img' && curr.attribs.src.startsWith('/')) {
            curr.attribs.src = dir + curr.attribs.src
        }
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
        fs.appendFileSync(dir + '/' + 'index.html', updatedLinksContent);
        cb()
    });
}

export { getPageContent, getDownloadableLinks, downloadAsset, changeLinksToLokal, loadPage }