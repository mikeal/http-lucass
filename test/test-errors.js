const fetch = require('node-fetch')
const test = require('tap').test
const inmem = require('lucass/inmemory')

let store = inmem()
store.set = store.hash = (value, cb) => {
  process.nextTick(() => cb(new Error('Not found.')))
}
let server = require('..//server')(store)

test('server errors', async t => {
  t.plan(5)
  await server.listen(2345)

  let resp
  resp = await fetch('http://localhost:2345', {method: 'PATCH'})
  t.same(resp.status, 404)

  resp = await fetch('http://localhost:2345/asdfaf', {method: 'GET'})
  t.same(resp.status, 404)

  resp = await fetch('http://localhost:2345/_set.lucass', {method: 'PUT'})
  t.same(resp.status, 404)

  resp = await fetch('http://localhost:2345/_hash.lucass', {method: 'PUT'})
  t.same(resp.status, 404)

  resp = await fetch('http://localhost:2345/9a8sd98asdf', {method: 'PUT'})
  t.same(resp.status, 404)

  await server.close()
})
