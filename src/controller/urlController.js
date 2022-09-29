const shortUrl = require('node-url-shortener')
const ValidUrl = require('valid-url')
const urlModel = require('../model/urlModel')


const createShortUrl = async function (req, res) {
    let data = req.body.longUrl
    shortUrl.short(data, function (err, url) { console.log(url) })
    res.status(201).send({ status: true, data:"msg" })
}


module.exports = { createShortUrl }