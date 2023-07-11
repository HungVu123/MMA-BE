const mongoose = require('mongoose');
const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: [true,"Please Enter Product Name"],
        trim:true,
    },
    des:{
        type: String,
        required: [true,"Please Enter Product Description"],
    },
    price:{
        type: Number,
        required: [true,"Please Enter Product Price"],
    },
    ratings:{
        type: Number,
        default:0
    },
    images:[
        {
            public_id:{
                type: String,
                required: true
            },
            url:{
                type: String,
                required: true
            }
        }
    ],
    category:{
        type: String,
        required: [true,"Please Enter Product Category"],
    },
    stock:{
        type: Number,
        required: [true,"Please Enter Product Stock"],
        maxlength:[4,"Stock cannot exceed 4 character"],
        default:1
    },
    numOfReviews:{
        type: Number,
        default:0
    },
    reviews:[
    {
        user:{
            type: mongoose.Schema.ObjectId,
            ref: "User",
            required:true,
        },
        name:{
            type:String,
            required:true,
        },
        avatarUrl: {
              type: String,
              required: true,
          },
        rating:{
            type:Number,
            require:true,
        },
        comment:{
            type:String,
            required:true,
        },
        createReviewAt:{
            type:Date,
            default:Date.now
        }
    }
    ],
    user:{
        type: mongoose.Schema.ObjectId,
        ref: "User",
        required:true,
    },
    createAt:{
        type:Date,
        default:Date.now
    }
})

module.exports = mongoose.model("Product",productSchema)