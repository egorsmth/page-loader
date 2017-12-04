#!/usr/bin/env node

import commander from 'commander'
import loadPage from '../'

commander
    .version(0.1)
    .option('-o, --out', 'Output directory')
    .arguments('<url>')
    .action((url) => {
        const output = loadPage(url, commander.out)
        console.log(output)
    })
    .parse(process.argv)