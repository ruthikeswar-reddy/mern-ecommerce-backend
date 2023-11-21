const userModel = require('../models/userModel');
const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const ErrorHandler = require('../utils/ErrorHandler')
const sendToken = require('../utils/jwtToken');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');
const productModel = require('../models/productModel');
const cloudinary = require('cloudinary');

// register a user

exports.userRegister = catchAsyncErrors(async(req, res, next)=>{

    const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
        folder: "avatars",
        width: 150,
        crop:"scale",

    })


    const {name, email, password} = req.body

    const user = await userModel.create({
        name,email,password,
        avatar:{
            public_id:myCloud.public_id,
            url:myCloud.secure_url,
        },
    })

    sendToken(user,201,res)
})


// LOGIN USER

exports.loginUser = catchAsyncErrors(async(req, res, next)=>{

    const {email, password} = req.body

    // checking if the user has entered both email and password
    if(!email || !password){
        return next(new ErrorHandler("Please enter email & password",400))
    }

    const user = await userModel.findOne({email:email}).select("+password");

    if(!user){
        return next(new ErrorHandler("Please enter the correct email and password",401))
        //status code 401 : unauthorized user
    }

    const isPasswordMatched = await user.comparePassword(password);

    if(!isPasswordMatched){
        return next(new ErrorHandler("please enter the correct email and password", 401))
    }

    sendToken(user,200,res)




})


//LOGOUT USER

exports.logout = catchAsyncErrors(async(req, res, next) => {

    res.cookie('token',null,{
        expires:new Date(Date.now()),
        httpOnly:true
    })


    res.status(200).json({
        success:true,
        message:'logged out successfully'
    })
})


//FORGOT PASSWORD

exports.forgotPassword = catchAsyncErrors(async(req, res, next)=>{

    const user = await userModel.findOne({email:req.body.email})
    // ecommerce website user enters the mail and click forgot password. so we need to access the user by email

    if(!user){
        return next(new ErrorHandler("User not found", 404))
    }

    // Get Reset password Token
    const resetToken = await user.generateResetPasswordToken();

    // to save the generated resetPasswordToken and resetPasswordExpire to the user.. we have to save now
    await user.save({vaidateBeforeSave:false});

    const resetPasswordUrl = `${process.env.FRONTEND_URL}/user/resetPassword/${resetToken}`;

    // here req.protocol is http and host is localhost

    const message = `Your Password Reset Token is :- \n\n ${resetPasswordUrl} \n\n If you not requested for this email, then please ignore it.`


    try {

        await sendEmail({
            email:user.email,
            subject:"Ecommere Password Recovery",
            message,
        })

        res.status(200).json({
            success:true,
            message:`Email sent to ${user.email} successfully`
        })
        
    } catch (error) {
        user.resetPasswordToken =undefined;
        user.resetPasswordExpire= undefined;
        await user.save({vaidateBeforeSave:false});
        
        return(next(new ErrorHandler(error.message,500)))
        
    }
})


// RESET PASSWORD

exports.resetPassword = catchAsyncErrors(async(req, res, next)=>{
    

    // we are hashing the received resetToken, because the data records saved in user model are originally have the hashed resetToken.


    const hashResetToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex")

    const user = await userModel.findOne({
        resetPasswordToken:hashResetToken,
        resetPasswordExpire:{$gt:Date.now()}
    });

    if(!user){
        return next(new ErrorHandler("Reset Password token is invalid or has been expired",404))
    }

    if( req.body.password !== req.body.confirmPassword){
        return next(new ErrorHandler("Password Doesn't match",400))
    }

    user.password = req.body.password;

    // we need to reset the values of the user's  resetPasswordToken and resetPasswordExpire as they are used now.

    user.resetPasswordToken= undefined;
    user.resetPasswordExpire = undefined;

    // save the user crediantionals now
    await user.save();

    sendToken(user,200,res)


})



// GET USER DETAILS

exports.getUserDetails = catchAsyncErrors(async(req, res, err)=>{
    const user = await userModel.findById(req.user.id)

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    res.status(200).json({
        success:true,
        user
    })
})


// UPDATE OR CHANGE USER PASSWORD

exports.updateChangePassword = catchAsyncErrors(async(req, res, next) =>{
    const user = await userModel.findById(req.user.id).select("+password");

    if(!user){
        return next(new ErrorHandler("User not found",400))
    }

    const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

    if(!isPasswordMatched){
        return next(new ErrorHandler("Old Password is incorrect", 400));
    }

    if(req.body.newPassword !== req.body.confirmPassword){
        return next(new ErrorHandler("Old Password is incorrect", 400));
    }

    user.password = req.body.newPassword;

    await user.save();

    sendToken(user,200,res)
    

    
})



//UPDATE USER PROFILE

exports.updateUserProfile = catchAsyncErrors(async(req, res, next)=>{

    const newUserData = {
        name: req.body.name,
        email: req.body.email,
    }

    // we will add cloudinary later.
    if (req.body.avatar !== "") {
        const user = await userModel.findById(req.user.id);
    
        const imageId = user.avatar.public_id;
    
        await cloudinary.v2.uploader.destroy(imageId);
    
        const myCloud = await cloudinary.v2.uploader.upload(req.body.avatar, {
          folder: "avatars",
          width: 150,
          crop: "scale",
        });
    
        newUserData.avatar = {
          public_id: myCloud.public_id,
          url: myCloud.secure_url,
        };
      }

    const user = await userModel.findByIdAndUpdate(req.user.id,newUserData,{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })

    res.status(200).json({
        success:true
    })
})



// GET ALL USERS -- admin

exports.getAllUsers = catchAsyncErrors(async(req, res, next)=>{
    const allUsers = await userModel.find()

    res.status(200).json({
        success:true,
        allUsers
    })
})

//GET SINGLE USER

exports.getSingleUser = catchAsyncErrors(async(req, res, next)=>{
    const user = await userModel.findById(req.params.id)

    if(!user){
    return next(new ErrorHandler(`User not found with id: ${req.params.id}`,404))
    }

    res.status(200).json({
        success:true,
        user,
    })
})


// UPDATE USER ROLE -- ADMIN

exports.updateUserRole = catchAsyncErrors(async(req, res, next)=>{

    const newRole ={
        name:req.body.name,
        email:req.body.email,
        role: req.body.role
    }

    const user = await userModel.findByIdAndUpdate(req.params.id,newRole,{
        new:true,
        runValidators:true,
        userFindAndModify:false,
    })

    if(!user){
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`,404))
    }

    res.status(200).json({
        success:true,
        user
    })
})


// DELETE A USER -- ADMIN

exports.deleteUser = catchAsyncErrors(async(req, res, next)=>{
    
    const user = await userModel.findById(req.params.id)

    // we will remove cloudinary later

    if(!user){
        return next(new ErrorHandler(`User not found with id: ${req.params.id}`,404))
    }

    await user.deleteOne()

    res.status(200).json({
        success:true,
        message:"user deleted successfully"
    })

})


//CREATE A REVIEW OR UPDATE A REVIEW

exports.createProductReview = catchAsyncErrors(async(req, res, next)=>{
    const {rating, comment, productId} = req.body;

    const review = {
        user:req.user._id,
        name:req.user.name,
        comment,
        rating:Number(rating)
    }

    const product = await productModel.findById(productId);

    const isReviewed = product.reviews.find(rev=> rev.user.toString()===req.user._id.toString())

    // where when we create a review(1st person) it is going to be saved as a
    // array of object {user,name,rating,comment} here in user=user_id we saved user_id while creating it.
    //  we search in the product.review array by taking single object in array and compare review(user_id) to the persons user_id who is logged in now.
    // when we get a match we can conclude that,that person already reviewed once and now we are gonna update it.


    if(isReviewed){
        product.reviews.forEach(rev =>{
            if(rev.user.toString()=== req.user._id.toString()){
                rev.rating=rating,
                rev.comment = comment
            }
        })

    }
    else{
        //we have a review array in the product schema

        product.reviews.push(review)
        product.numOfReviews = product.reviews.length

    }

    let avg = 0;

    product.reviews.forEach(rev =>{
        avg+=rev.rating;
    })

    product.ratings = avg/product.reviews.length

    await product.save({validateBeforeSave:false})


    res.status(200).json({
        success:true,

    })
})


//GET ALL REVIEWS OF A PRODUCT

exports.getAllReviewsOfAProduct = catchAsyncErrors(async(req, res, next)=>{

    const product = await productModel.findById(req.query.id);

    // req.query.id gives the product id to find the product

    if(!product){
        return next(new ErrorHandler("Product not found", 404));
    }

    res.status(200).json({
        success:true,
        reviews:product.reviews
    })
})



//DELETE A REVIEW

exports.deleteReview = catchAsyncErrors(async(req, res, next)=>{

    //1. find the product
    const product = await productModel.findById(req.query.productId)


    if(!product){
        return next(new ErrorHandler("Product not Found", 404))
    }

    //2. filter method filters the array and returns the new array with elements satisfying the conditions

    const reviews = product.reviews.filter(
        (rev)=> rev._id.toString() !== req.query.id.toString());
    
    // 3. we filter the array such that it contains every review except with review whose user review id is req.query.id
    // here we have to know the id of the review we want to get deleted, and we have to provide it.


    let avg=0;

    // here we find the average of ratings of the filtered reviews / new review array
    reviews.forEach(rev =>{
        avg+=rev.rating;
    })

    const ratings = avg/reviews.length;

    const numOfReviews = reviews.length;

    await productModel.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        userFindAndModify:false
    })

    res.status(200).json({
        success:true,
        
    })



})
