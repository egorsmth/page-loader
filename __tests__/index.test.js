import {getpageContent, getDownloadableLinks} from '../src/';
import nock from 'nock';

const html = '<html><head><link rel="/style.css"></head><body><img href="/pic.png"></body></html>'
const remote = nock('https://mysite.com')
    .get('/')
    .reply(200, html)

const result = [
    'https://mysite.com/style.css',
    'https://mysite.com/pic.png'
];

const url = 'https://mysite.com/'

test('gets page content', () => {
    expect(getpageContent(url)).toBe(html)
});

test('gets downloadable links', () => {
    expect(getDownloadableLinks(html)).toBe(result)
});

