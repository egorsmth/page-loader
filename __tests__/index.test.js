import { prepareDir, getPageContent, getDownloadableLinks, downloadAsset, changeLinksToLokal, loadPage } from '../src/';
import nock from 'nock';
import fs from 'fs-extra';

const url = 'https://mysite.com';
const directory = '__tests__/tmp';
const html = '<html><head><link href="/style.css"></head><body><img src="/pic.jpg"></body></html>'
const resultHtml = `<html><head><link href="${directory}/style.css"></head><body><img src="${directory}/pic.jpg"></body></html>`
const remote = nock('https://mysite.com')
    .persist()
    .get('/')
    .reply(200, html)

const result = [
    '/style.css',
    '/pic.jpg'
];

const style = nock('https://mysite.com/style.css')
    .persist()
    .get('')
    .replyWithFile(200, __dirname + '/fixtures/style.css', { 'Content-Type': 'application/json' });

const img = nock('https://mysite.com/pic.jpg')
    .persist()
    .get('')
    .replyWithFile(200, __dirname + '/fixtures/pic.jpg', { 'Content-Type': 'application/json' });



beforeAll(() => {
    fs.removeSync(directory)
    fs.mkdirsSync(directory)
});

test('prepare dir', () => {
    const dir = prepareDir(directory + '/')
    expect(dir).toEqual(directory)
});

test('gets page content', () => {
    getPageContent(url, (err, res) => {
        expect(res).toBe(html);
    })
});

test('gets downloadable links', () => {
    expect(getDownloadableLinks(html)).toEqual(result)
});

test('download asset', done => {
    const fname = directory + result[0];
    const r = downloadAsset(result[0], url, directory, (err) => {
        if (err) {
            expect(err).toEqual('');
            done();
        }
        expect(fs.existsSync(fname)).toEqual(true);
        expect(fs.readFileSync(fname).toString()).toEqual(fs.readFileSync(__dirname + '/fixtures/' + result[0]).toString());
        fs.unlinkSync(fname);
        done();
    });
});

test('change links to local', () => {
    const newHtml = changeLinksToLokal(html, directory)
    expect(newHtml)
        .toEqual(resultHtml);
});

test('flow', done => {
    loadPage(url, directory + '/', (err) => {
        if (err) {
            expect(err).toEqual('');
            done();
        }
        expect(fs.readFileSync(directory + '/index.html').toString())
            .toEqual(resultHtml);
        done();
    });
});