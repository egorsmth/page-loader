import fs from 'fs-extra'
import https from 'https'
import cheerio from 'cheerio'
import shell from 'shelljs'
import path from 'path'
import { URL } from 'url'

const prepareDir = (dir) => {
    fs.ensureDirSync(dir)
    if (dir.endsWith('/')) {
        return dir.substring(0, dir.length-1)
    }
    return dir
}

const getPageContent = (url, cb) => {
    if (!url.endsWith('/')) {
        url += '/'
    }
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

const getDownloadableLinks = (html) => {
    let urls = []
    const content = cheerio.load(html)
    const links = [...content('link')]
    const imgs = [...content('img')]

    const total = [...links, ...imgs]
    return total.reduce((prev, curr) => {
        if (curr.name == 'link' && curr.attribs.href.startsWith('/')) {
            let myURL = curr.attribs.href
            let queryPartIndex = curr.attribs.href.indexOf('?')
            if (queryPartIndex != -1) {
                myURL = curr.attribs.href.substring(0, queryPartIndex);
            }
            return [...prev, myURL]
        } else if (curr.name == 'img' && curr.attribs.src.startsWith('/')) {
            let myURL = curr.attribs.src
            let queryPartIndex = curr.attribs.src.indexOf('?')
            if (queryPartIndex != -1) {
                myURL = curr.attribs.src.substring(0, queryPartIndex);
            }
            return [...prev, myURL]
        } else {
            return prev
        }
    }, [])
}

const downloadAsset = (asset, url, dir, cb) => {
    
    https.get(url + asset, (res) => {
        res.on('data', (data) => {
            try {
                const assetDir = path.join(dir, asset)
                fs.ensureDirSync(dir)
                fs.appendFileSync(assetDir, data)
                console.log(`${assetDir} downloaded!`)
                cb()
            } catch (err) {
                cb(err)
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
    dir = prepareDir(dir)
    getPageContent(url, (err, content) => {
        if (err) {
            console.error(err)
        }
        const links = getDownloadableLinks(content)
        links.map((link) => {
            downloadAsset(link, url, dir, (err) => {
                if (err) {
                    console.error(`error ${link} ${url}`)
                    console.error(err)
                }
            });
        });
        const updatedLinksContent = changeLinksToLokal(content, dir);
        const indexPath = path.join(dir, 'index.html');
        fs.appendFileSync(indexPath, updatedLinksContent);
        cb()
    });
}

export { prepareDir, getPageContent, getDownloadableLinks, downloadAsset, changeLinksToLokal, loadPage }