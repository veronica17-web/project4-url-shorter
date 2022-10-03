const shortId = require('shortid')
const validUrl = require("is-valid-http-url")
const urlModel = require('../model/urlModel')
const redis = require('redis')
const { promisify } = require('util')

const isValid = function (value) {
    if (typeof value !== "string" || value.trim().length === 0) {
        return false;
    }
    return true;
};


const createShortUrl = async function (req, res) {
    try {
        let data = req.body
        //checking existen of data in body
        if (Object.keys(data).length === 0) {
            return res.status(400)
                .send({ status: false, message: "required data" })
        }
        //checking longurl is present or not
        if (!Object.keys(data).includes('longUrl')) {
            return res.status(400)
                .send({ status: false, message: "required longUrl" })
        }
        //checking data is in string format or not
        if (!isValid(data.longUrl)) {
            return res.status(400)
                .send({ status: false, message: " long url must be in string" })
        }
        //checking is valid url or not
        if (!validUrl(data.longUrl)) {
            return res.status(400)
                .send({ status: false, message: "invalid long url" })
        }
        //checking the that data is present in Db 
        let isExist = await urlModel.findOne({ longUrl: data.longUrl }).select({ longUrl: 1, shortUrl: 1, urlCode: 1, _id: 0 })
        // if present sending it in responds
        if (isExist) {
            return res.status(400)
                .send({ status: false, message: "already exist", data: isExist })
        }
        let baseUrl = "http://localhost:3000/"
        data.urlCode = shortId.generate().toLocaleLowerCase()
        data.shortUrl = baseUrl + data.urlCode

        await urlModel.create(data)
        return res.status(201).send({ status: true, data: data })
    }
    catch (err) { res.status(500).send(err.message) }
}
//==============================Geturlcode==========================================================

const fetchUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode
        
        //checking the in path variable that short url present or not
        if (urlCode === ":urlCode") { 
                return res.status(404).send({ status: false, message: 'required urlcode' }) }

        //checking is it valid short url or not
        if (!shortId.isValid(urlCode)) {
                 return res.status(404).send({ status: false, message: 'short url is in valid' }) }

        const redisClient = redis.createClient(
            17416,//port number
            "redis-17416.c301.ap-south-1-1.ec2.cloud.redislabs.com",//ip address
            { no_ready_check: true }
        );
        redisClient.auth("ocV23EoARL37Be3XZGjj6qL7FzFCDkhk", function (err) {//password
            if (err) throw err;
        });

        redisClient.on("connect", async function () {
            console.log("Connected to Redis..");
        });

        const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
        const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);
        //const DEL_ASYNC = promisify(redisClient.DEL).bind(redisClient);
         

        let cacheUrlData = await GET_ASYNC(urlCode);// catch call
        if (cacheUrlData && cacheUrlData != 'null') { 
            let object = JSON.parse(cacheUrlData)// converts string to obj

            return res.status(302).redirect(object.longUrl);
        } else {
            let urlData = await urlModel.findOne({ urlCode: urlCode })

            if (!urlData) {
                return res.status(404).send({ status: false, message: 'No URL Found' })
            }
            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData));

            return res.status(302).redirect(urlData.longUrl)
        }

    } catch (err) {

        res.status(500).send({ msg: err.message })
    }
}

module.exports = { createShortUrl, fetchUrl }

