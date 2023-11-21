const ErrorHandler = require('../utils/ErrorHandler')
const errorHandler = require('../utils/ErrorHandler')

module.exports = (err, req, res, next)=>{
    err.statusCode = err.statusCode || 500,
    err.message = err.message || "product not found"


    //wrong mongodb product id error

    if(err.name === 'CastError'){
        const message = `resource not found. Invalid id: ${err.path}`
        err = new ErrorHandler(message, 400)
        //statusCode=400 ::: Bad request
    }

    // Mongoose duplicate key error

    if(err.code=== 11000){
        const message = `Duplicate ${Object.keys(err.keyValue)} entered`
        err = new ErrorHandler(message, 400);
    }

    // Wrong Jsonwebtoken error
    
    if(err.name === 'JsonWebTokenError'){
        const message = `Json Web Token is invalid, try again`;
        err = new ErrorHandler(message, 400)

    }

    // JWT EXPIRE ERROR
    if(err.name === 'TokenExpiredError'){
        const message = `Json Web Token is expired, try again`;
        err = new ErrorHandler(message, 400)

    }

    res.status(err.statusCode).json({
        success: false,
        message: err.message,
    
    }
    )
}