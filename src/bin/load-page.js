#!/usr/bin/env node

import commander from 'commander'
import { loadPage } from '../'

commander
    .version(0.1)
    .option('-o, --out', 'Output directory', '/vagrant/p2/origin')
    .arguments('<url>')
    .action((url) => {
        loadPage(url, commander.out, ()=>{})
    })
    .parse(process.argv)