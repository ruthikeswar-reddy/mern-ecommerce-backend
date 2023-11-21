const mongoose = require('mongoose')

const databaseConn = ()=>{

mongoose.connect(process.env.DB_URI, {useNewUrlParser: true, useUnifiedTopology: true}).
then((data)=>{
    console.log(`Mongodb connected to the host ${data.connection.host} successfully`)
})

}

module.exports = databaseConn;