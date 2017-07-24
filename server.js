const promisify = require('util').promisify
const micro = require('micro')

const propPromise = (inst, prop) => {
  return promisify((...args) => inst[prop](...args))
}

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
      if (req.url === '/_set.lucass') return or404(set(req), res)
      else if (req.url === '/_hash.lucass') return or404(hash(req), res)
    } else if (req.method === 'GET') {
      let hash = req.url.slice(1)
      return or404(get(hash), res)
    }
    micro.send(res, 404)
  })
  return server
}
