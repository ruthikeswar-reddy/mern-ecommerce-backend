const orderModel = require('../models/orderModel');
const ErrorHandler = require('../utils/ErrorHandler');
const catchAsyncErrors = require('../middleware/catchAsyncErrors');
const productModel = require('../models/productModel');

// CREATE NEW ORDER

exports.createOrder = catchAsyncErrors(async(req, res, next)=>{

    const {
        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice
    }=req.body;

    const order = await orderModel.create({

        shippingInfo,
        orderItems,
        paymentInfo,
        itemsPrice,
        taxPrice,
        shippingPrice,
        totalPrice,
        paidAt:Date.now(),
        user:req.user._id,

    });

    res.status(201).json({
        success:true,
        order,
    })
    
})



// GET SINGLE ORDER

exports.getSingleOrder = catchAsyncErrors(async(req, res, next)=>{

    const order = await orderModel.findById(req.params.id).populate(
        "user",
        "name email"
    )

    // populate method is used to access data from another model .
    // populate method uses user_id in the user database and finds user_id's name and email.

    if(!order){
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    res.status(200).json({
        success:true,
        order,

    })
})


// GET LOGGED IN USER ORDERS

exports.myOrders = catchAsyncErrors(async(req, res, next)=>{

    const orders  = await orderModel.find({user:req.user._id})

    res.status(200).json({
        success:true,
        orders,
    })
})


//GET ALL ORDERS -- ADMIN

exports.getAllOrders = catchAsyncErrors(async(req, res, err)=>{

    const allOrders = await orderModel.find();

    let totalAmount = 0;

    allOrders.forEach(order =>{
        totalAmount+=order.totalPrice;
    });

    res.status(200).json({
        success:true,
        totalAmount,
        allOrders
    })
})



// UPDATE ORDER STATUS -- ADMIN

exports.updateOrderStatus = catchAsyncErrors(async(req, res, next)=>{

    const order = await orderModel.findById(req.params.id)

    if(!order){
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    if(order.orderStatus==="Delivered"){
        return next(new ErrorHandler("You have already deliverd this order",400));

    }

    order.orderItems.forEach(async(o) =>{
        await updateStock(o.product, o.quantity);
    })

    order.orderStatus = req.body.status;

    if(req.body.status==="Delivered"){
        order.deliveredAt = Date.now()
    }

    await order.save({validateBeforeSave:false})

    res.status(200).json({
        success:true,

    })
})


async function updateStock(id, quantity){
    const product = await productModel.findById(id);

    product.stock -=quantity;

    await product.save({validateBeforeSave:false})
}


// DELETE A ORDER -- ADMIN

exports.deleteOrder = catchAsyncErrors(async(req, res, next)=>{

    const order = await orderModel.findById(req.params.id);

    if(!order){
        return next(new ErrorHandler("Order not found with this Id", 404));
    }

    await order.deleteOne();

    res.status(200).json({
        success:true,
        message:"order deleted successfully"
    })
})