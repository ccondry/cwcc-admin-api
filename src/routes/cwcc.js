const express = require('express')
const router = express.Router()
const cwcc = require('../models/cwcc')

const types = {
  'virtual-team': 'virtualTeam'
}

//
router.get('/:type', async function (req, res, next) {
  const username = req.user.username
  const userId = req.user.id
  const clientIp = req.clientIp
  const method = req.method
  const host = req.get('host')
  const path = req.originalUrl
  const url = req.protocol + '://' + host + path
  const operation = 'list CWCC ' + req.params.type

  try {
    console.log('user', username, 'at IP', clientIp, operation, method, path, 'requested')
    // determine type from type parameter
    const objType = types[req.params.type]
    // get data from CWCC
    const data = await cwcc[objType].list()
    const dataLength = data.length
    response = `(JSON array with ${dataLength} elements)`
    // return results
    res.status(200).send(data)
  } catch (e) {
    // error
    console.log('user', username, 'at IP', clientIp, operation, method, path, 'error', e.message)
    // return 500 SERVER ERROR
    res.status(500).send(e.message)
  }
})

module.exports = router
