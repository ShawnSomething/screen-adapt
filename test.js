const postcss = require('postcss')
const fs = require('fs')
const plugin = require('./dist/index.js')

const css = fs.readFileSync('./test.css', 'utf8')

postcss([plugin.default])
  .process(css, { from: 'test.css' })
  .then((result) => {
    console.log(result.css)
  })