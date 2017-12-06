import {getPageContent, getDownloadableLinks, downloadAsset} from '../src/';
import nock from 'nock';
import fs from 'fs';

const html = '<html><head><link src="/style.css"></head><body><img href="/pic.jpg"></body></html>'
const remote = nock('https://mysite.com')
    .get('/')
    .reply(200, html)

const result = [
    '/style.css',
    '/pic.jpg'
];

const style = nock('https://mysite.com/style.css')
    .get('')
    .replyWithFile(200, __dirname + '/fixtures/style.css', { 'Content-Type': 'application/json' });

const img = nock('https://mysite.com/pic.png')
    .get('')
    .replyWithFile(200, __dirname + '/fixtures/pic.jpg', { 'Content-Type': 'application/json' });

const url = 'https://mysite.com';
const directory = __dirname + '/tmp';

test('gets page content', () => {
    getPageContent(url, (err, res) => {
        expect(res).toBe(html)
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
        expect(fs.readFileSync(fname).toString()).toEqual(fs.readFileSync(__dirname + '/fixtures' + result[0]).toString());
        fs.unlinkSync(fname);
        done();
    });
});

test('change links to local', () => {
    const newHtml = changeLinksToLokal(html, directory)
    expect(newHtml)
        .toEqual(`<html><head><link src="#{directory}/style.css"></head><body><img href="#{directory}/pic.jpg"></body></html>`);
});

test('flow', done => {
    loadPage(url, directory, (err) => {
        if (err) {
            expect(err).toEqual('');
            done()
        }
        expect(fs.readFileSync(directory + 'index.html').toString())
            .toEqual(`<html><head><link src="#{directory}/style.css"></head><body><img href="#{directory}/pic.jpg"></body></html>`);
        done();
    });
});