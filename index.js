const express = require('express')
const mongoose = require('mongoose')
const route = require('./src/route/route')
const app = express()
const port = 3000

app.use(express.json())


mongoose.connect("mongodb+srv://kusum_99:9vJ9mxlJH1cYZ1oO@cluster0.jelghm1.mongodb.net/urlshortner-db",{
    useNewUrlParser: true 
    })
    .then(() => console.log("MongoDB Running"))
    .catch(err => console.log(err))

app.use('/', route)

app.use('/*', function (req, res) {
    return res.status(400).send({ status: false, msg: "Wrong URL Path" })
})

app.listen(port, function () {
    console.log('Express Running On ' + port)
})




