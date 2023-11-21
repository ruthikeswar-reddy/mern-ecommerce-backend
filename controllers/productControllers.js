const catchAsyncErrors = require('../middleware/catchAsyncErrors')
const productModel = require('../models/productModel')
const ErrorHandler = require('../utils/ErrorHandler')
const ApiFeatures = require('../utils/apiFeatures')


// CREATE A PRODUCT ----- ADMIN

exports.createProduct =catchAsyncErrors( async(req, res, next)=>{

    // req.body.user means we are adding user attribute to the json data to create a product by user admin.
    // we are accessing the user id, after user logged in req.user.id access the userModel records data for user_id.

    req.body.user = req.user.id
    const new_product = await productModel.create(req.body)
    // status 201: means created
    res.status(201).json({
        success:true,
        new_product
    })
})

// GET ALL PRODUCTS

exports.getAllProducts = catchAsyncErrors(async(req, res, next)=>{

    

    const productsCount = await productModel.countDocuments();
    const resultPerPage = 8;
    const apiFeatures =new  ApiFeatures(productModel.find(), req.query)
        .search()
        .filter()
        
    // let products = await apiFeatures.query;
    

    apiFeatures.pagination(resultPerPage);
    
    // here query = productModel.find()
    // here queryStr = req.query 
    //http://localhost:3000/api/v1/products?name=apple
    // req.query means in the link we pass to get all products we mention search name as keyword(name): value(apple), i.e keyword:product_name
    // req.query gives {name ='apple'}


    const allProducts = await apiFeatures.query
    let filteredProductsCount = allProducts.length;
    // status 200 means OK
    res.status(200).json({
        success:true,
        allProducts,
        productsCount,
        resultPerPage,
        filteredProductsCount,
        
    })
})

// GET A SINGLE PRODUCT

exports.getSingleProduct =catchAsyncErrors( async(req,res,next) => {
    const single_product = await productModel.findById(req.params.id)

    if(!single_product){
        return next(new ErrorHandler("product not found", 500))
    }

    res.status(200).json({
        success:true,
        single_product
    })


})


// UPDATE A PRODUCT---- ADMIN

exports.updateProduct = catchAsyncErrors(async(req, res, next)=>{
    let product = await productModel.findById(req.params.id)
    //http://localhost:3000/api/v1/product/64956ff0b0f6bbdec9d542a0
    //  the above link is considered as a request. the req.params.id returns the id after the product

    
        //status 500-internal server error
        if(!product){
            return next(new ErrorHandler("product not found", 500))
        }

    // here req.body means we enter the details to be changed when passing the request in the json()/ object format
    product = await productModel.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
        useFindAndModify:false})

    res.status(200).json({
        success:true,
        product
    })
})

//DELETE A PRODUCT

exports.deleteProduct = catchAsyncErrors(async(req, res, next)=>{

    const product = await productModel.findById(req.params.id)
    if(!product){
        return next(new ErrorHandler("product not found", 500))
    }

    await product.deleteOne()

    res.status(200).json({
        success: true,
        message:'product deleted successfully'
    })
})