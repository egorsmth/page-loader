#!/usr/bin/env node

import commander from 'commander'
import { loadPage } from '../'

commander
    .version(0.1)
    .option('-o, --out', 'Output directory', '/vagrant/p2/ziga')
    .arguments('<url>')
    .action((url) => {
        console.log(commander.out)
        loadPage(url, commander.out, ()=>{})
    })
    .parse(process.argv)