const promisify = require('util').promisify
const micro = require('micro')

const propPromise = (inst, prop) => {
  return promisify((...args) => inst[prop](...args))
}

const f = s => s // function to filter for positive values.

module.exports = store => {
  let get = propPromise(store, 'getBuffer')
  let set = propPromise(store, 'set')
  let hash = propPromise(store, 'hash')

  let or404 = async (p, res) => {
    try {
      return await p
    } catch (e) {
      return micro.send(res, 404)
    }
  }

  const server = micro(async (req, res) => {
    // console.error(req.method, req.url)
    if (req.method === 'PUT') {
      if (req.url.startsWith('/_set.lucass')) {
        let args = req.url.slice('/_set.lucass'.length).split('/').filter(f)
        return or404(set(req, ...args), res)
      } else if (req.url.startsWith('/_hash.lucass')) {
        let args = req.url.slice('/_hash.lucass'.length).split('/').filter(f)
        return or404(hash(req, ...args), res)
      } else {
        return micro.send(res, 404)
      }
    } else if (req.method === 'GET') {
      let hash = req.url.slice(1)
      return or404(get(hash), res)
    }
    micro.send(res, 404)
  })
  return server
}
