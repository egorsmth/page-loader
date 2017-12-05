import {getPageContent, getDownloadableLinks} from '../src/';
import nock from 'nock';

const html = '<html><head><link src="/style.css"></head><body><img href="/pic.png"></body></html>'
const remote = nock('https://mysite.com')
    .get('/')
    .reply(200, html)

const result = [
    '/style.css',
    '/pic.png'
];

const url = 'https://mysite.com/'

test('gets page content', () => {
    getPageContent(url, (err, res) => {
        expect(res).toBe(html)
    })
});

test('gets downloadable links', () => {
    expect(getDownloadableLinks(html)).toEqual(result)
});

