/* globals window, global */
/* eslint-disable */
window = {}
window.fetch = {}
window.location = {protocol: 'test:', host: 'testhost.now'}
/* eslint-enable */
global.window = window
process.browser = true
const test = require('tap').test
const createStore = require('../')

let _current

let fetchError = () => {
  _current = new Promise((resolve, reject) => {
    setTimeout(() => {
      reject(new Error('Nope.'))
    })
  })
  return _current
}
let fetchResponse500 = async () => {
  return {status: 500}
}

const store = createStore()

test(`browser: test origin`, t => {
  t.plan(1)
  t.same(store.baseurl, 'test://testhost.now/')
})

const supress = async p => {
  try {
    await p
  } catch (e) {
    return 'ok'
  }
}

test(`browser: fetchErrors`, async t => {
  t.plan(8)
  global.fetch = fetchError
  window.fetch = fetchError
  store.getBuffer('asdf', e => {
    t.same(e.message, 'Nope.')
    t.type(e, 'Error')
  })
  await supress(_current)
  store.set(Buffer.from('sadf'), e => {
    t.same(e.message, 'Nope.')
    t.type(e, 'Error')
  })
  await supress(_current)
  store.hash(Buffer.from('sadf'), e => {
    t.same(e.message, 'Nope.')
    t.type(e, 'Error')
  })
  await supress(_current)
  let stream = store.getStream('asdf')
  stream.on('error', e => {
    t.same(e.message, 'Nope.')
    t.type(e, 'Error')
  })
  await supress(_current)
})

test(`browser: fetchResponse500`, t => {
  t.plan(8)
  global.fetch = fetchResponse500
  window.fetch = fetchResponse500

  store.getBuffer('asdf', e => {
    t.same(e.message, 'Not found. 500')
    t.type(e, 'Error')
  })
  store.set(Buffer.from('sadf'), e => {
    t.same(e.message, 'Not found. 500')
    t.type(e, 'Error')
  })
  store.hash(Buffer.from('sadf'), e => {
    t.same(e.message, 'Not found. 500')
    t.type(e, 'Error')
  })
  store.getStream('asdf').on('error', e => {
    t.same(e.message, 'Not found. 500')
    t.type(e, 'Error')
  })
})
