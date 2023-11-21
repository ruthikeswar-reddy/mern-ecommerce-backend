const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required:[true, "Please enter the product name"],
        trim: true
    },
    description:{
        type: String,
        required:[true, "Please enter the product description"]
    },
    price:{
        type: Number,
        required:[true, "Please enter the product price"],
        maxLength:[8,"Price should not be more than 8 characters"]
    },
    ratings:{
        type: Number,
        default:0
    },
    image:[{
        public_id:{
            type: String,
            required: true
        },
        url:{
            type: String,
            required: true
        }
    }],
    category:{
        type:String,
        required:[true, "Please enter the product category"]
    },
    stock:{
        type:Number,
        maxLength:[4,"stock should be less than 4 characters"],
        default:1
    },

    numOfReviews:{
        type:Number,
        default:0,
    },

    reviews:[
        {
            user:{
                type: mongoose.Schema.ObjectId,
                ref:'User',
                required:true
        
            },
            name:{
                type:String,
                required:[true, "Please enter the reviewer name"]
            },
            rating:{
                type:Number,
                required: true
            },
            comment:{
                type:String,
                required: true
            }

        }
    ],


    user:{
        type: mongoose.Schema.ObjectId,
        ref:'User',
        required:true

    },
    createdAt:{
        type:Date,
        default:Date.now
    }
})

const productModel = new mongoose.model("productModel", productSchema);

module.exports = productModel;