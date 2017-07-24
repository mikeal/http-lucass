/* globals fetch */
const once = require('once')
const through = require('through2')

const proxy = () => through(function (data, enc, cb) {
  this.push(data)
  cb()
})

let origin
if (!process.browser) {
  global.fetch = require('node-fetch')
} else {
  origin = `${window.location.protocol}//${window.location.host}/`
}

class FetchLucass {
  constructor (baseurl = origin) {
    this.baseurl = baseurl
    if (!baseurl.endsWith('/')) {
      this.baseurl += '/'
    }
  }
  set (value, cb) {
    if (!value || (!Buffer.isBuffer(value) && !value.readable)) {
      return cb(new Error('Invalid type, value must be Buffer or Stream.'))
    }
    cb = once(cb)
    fetch(`${this.baseurl}_set.lucass`, {method: 'PUT', body: value})
    .then(res => {
      if (res.status !== 200) {
        return cb(new Error(`Not found. ${res.status}`))
      }
      return res.text()
    })
    .then(hash => cb(null, hash))
    .catch(cb)
  }
  getBuffer (hash, cb) {
    cb = once(cb)
    fetch(`${this.baseurl}${hash}`)
    .then(res => {
      if (res.status !== 200) {
        return cb(new Error(`Not found. ${res.status}`))
      }
      return res.buffer()
    })
    .then(data => cb(null, data))
    .catch(cb)
  }
  getStream (hash) {
    let stream = proxy()
    fetch(`${this.baseurl}${hash}`)
    .then(res => {
      if (res.status !== 200) {
        return stream.emit('error', new Error(`Not found. ${res.status}`))
      }
      res.body.pipe(stream)
    })
    .catch(err => stream.emit('error', err))
    return stream
  }
  hash (value, cb) {
    if (!value || (!Buffer.isBuffer(value) && !value.readable)) {
      return cb(new Error('Invalid type, value must be Buffer or Stream.'))
    }
    cb = once(cb)
    fetch(`${this.baseurl}_hash.lucass`, {method: 'PUT', body: value})
    .then(res => {
      if (res.status !== 200) {
        return cb(new Error(`Not found. ${res.status}`))
      }
      return res.text()
    })
    .then(hash => cb(null, hash))
    .catch(err => cb(err))
  }
}

module.exports = baseurl => new FetchLucass(baseurl)
