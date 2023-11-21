const ErrorHandler = require("../utils/ErrorHandler");
const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require('jsonwebtoken');
const userModel = require('../models/userModel')




exports.isAuthenticatedUser = catchAsyncErrors(async(req, res, next)=>{

    const token = req.cookies['token'];

    

    if(!token){

        // when the user tries to create/update/delete a product without logging in then we will have 
        // Error==JsonWebTokenError: jwt must be provided, because in the following we need token inorder to verify with the original
        // This error happens when the coming token is null or empty.
        next(new ErrorHandler("Please login to access this resource",402))

    }
    // jwt.verify is used to decode the token(transformed data ) to the original data.
    // for example jwt.sign(id,,) takes the id and convert it into jsonwebtoken.
    // this token is supplied to jwt.verify(token,,) to decode the token and give the id.
    const decodedToken = jwt.verify(token,process.env.JWT_SECRET);
    // Error==JsonWebTokenError: jwt must be provided. this occurs due to token is null or empty
    // when token is null means that the user is not logged into his account.

    req.user = await userModel.findById(decodedToken.id);

    next();
})


exports.authorizeRoles = (...roles)=>{
    
    // ...roles returns an array of [roles]
    return(req, res, next)=>{

        if(!roles.includes(req.user.role)){
            return next(new ErrorHandler(`ROLE: ${req.user.role} is not allowed to access this resource`, 403))
        }


        next();
    }
}
