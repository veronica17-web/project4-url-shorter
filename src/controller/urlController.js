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


module.exports = { createShortUrl }