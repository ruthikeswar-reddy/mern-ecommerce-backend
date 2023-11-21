const express = require('express')
const app = express()
const errorHandler = require('./middleware/error')
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser');
const fileupload = require('express-fileupload');
const dotenv = require("dotenv");


//config
dotenv.config({path: 'backend/config/config.env'})
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true}));
app.use(fileupload());

//Route imports
const productRoutes = require('./routes/productRoutes')
const userRoutes = require('./routes/userRoutes')
const orderRoutes = require('./routes/orderRoutes')
const paymentRoutes = require('./routes/paymentRoute')

app.use(cookieParser());

app.use('/api/v1',productRoutes)
app.use('/api/v1',userRoutes)
app.use('/api/v1',orderRoutes);
app.use('/api/v1',paymentRoutes);

//middleware imports

app.use(errorHandler)

module.exports = app