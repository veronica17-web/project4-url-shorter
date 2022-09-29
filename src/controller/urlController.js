const shortId = require('shortid')
const axios = require('axios')
const urlModel = require('../model/urlModel')


const createShortUrl = async function (req, res) {
    let longUrl = req.body.longUrl
   let option = {
    method:"get",
    url:longUrl
   }
   let result = await axios(option)
   .then(()=>longUrl)
   .catch(err => console.log(err))

   let baseUrl ="http://localhost:3000/" 
   let shortid =shortId.generate().toLocaleLowerCase()
   let shortUrl= baseUrl+shortid

 let data ={
    longUrl:longUrl,
    shortUrl:shortUrl,
    urlCode:shortid
 }
 await urlModel.create(data)
 return res.status(201).send({status:true,data:data})

}
//==============================Get urlcode==========================================================


const geturl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode.trim()
        if (!isValid(urlCode)) {
            res.status(400).send({ status: false, message: 'Please provide valid urlCode' })
        }

        const url = await urlModel.findOne({ urlCode: urlCode })   //check in Db

        if (!url) {
            return res.status(404).send({ status: false, message: 'No URL Found' })
        }

        return res.status(302).redirect(url.longUrl)

    } catch (err) {

        res.status(500).send({ msg: err.message })
    }
}


module.exports.geturl = geturl

module.exports = { createShortUrl }