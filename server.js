const app = require('./app');
const database_conn = require('./config/databaseconn')
const cloudinary = require("cloudinary")
const dotenv = require('dotenv')

//handling uncaught exceptions
process.on("uncaughtException", (err)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down the server due to uncaught exception")
})


//config
dotenv.config({path: 'backend/config/config.env'})

//connecting to the database
database_conn();

cloudinary.config({
    cloud_name:process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,

})

const server = app.listen(process.env.PORT, ()=>{
    console.log(`server is working on http://localhost:${process.env.PORT}`)
})


//Unhandled promise rejection

process.on("unhandledRejection",(err)=>{
    console.log(`Error: ${err.message}`)
    console.log("shutting down the server due to unhandled promise rejection ")

    server.close(()=>{
        process.exit(1);
    })
})