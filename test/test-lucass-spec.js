const testLucass = require('lucass/lib/test-basics')
const test = require('tap').test
const createStore = require('../')
const inmem = require('lucass/inmemory')

let server = require('..//server')(inmem())

test('setup server', async t => {
  await server.listen(2345)
})

testLucass('fetch', createStore('http://localhost:2345'))

test('close server', async t => {
  await server.close()
})
