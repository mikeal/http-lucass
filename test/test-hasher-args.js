const test = require('tap').test
const through = require('through2')
const createStore = require('../')
const inmem = require('lucass/inmemory')
const promisify = require('util').promisify

const propPromise = (inst, prop) => {
  return promisify((...args) => inst[prop](...args))
}

let server

test('setup server', async t => {
  t.plan(2)
  const argHasher = (one, two, three, cb) => {
    t.same([one, two, three], [1, 2, 3])
    return through(() => setTimeout(() => cb(null, 'asdf'), 100))
  }
  server = require('..//server')(inmem(argHasher))
  await server.listen(2346)
  let store = createStore('http://localhost:2346')
  let one = propPromise(store, 'set')(Buffer.from('asdf'), 1, 2, 3)
  let two = propPromise(store, 'hash')(Buffer.from('asdf'), 1, 2, 3)
  await Promise.all([one, two])
})

test('close server', async t => {
  await server.close()
})
