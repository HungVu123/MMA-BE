const Order = require("../models/orderModel");
const Product = require("../models/productModel");
const ErrorHander = require("../utils/errorhander");
const ApiFeatures = require("../utils/apifeatures");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

// Create new order
const createOrder = catchAsyncErrors(async (req, res, next) => {
  const {
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
  } = req.body;

  const order = await Order.create({
    shippingInfo,
    orderItems,
    paymentInfo,
    itemPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paidAt: Date.now(),
    user:req.user._id
  });

  res.status(200).json({
    success: true,
    order
  });
});

// Get single order
const getSingleOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id).populate("user","name email")

    if(!order){
        return next(new ErrorHander("Order not found with this Id",404));
    }

    res.status(200).json({
        success: true,
        order
      });
})

// Get logged in user order
const myOrders = catchAsyncErrors(async (req, res, next) => {
    const orders = await Order.find({user: req.user._id})

    res.status(200).json({
        success: true,
        orders
      });
})

// get all Orders -- Admin
const getAllOrders = catchAsyncErrors(async (req, res, next) => {
    const itemsPerPage = 8;
    const ordersCount = await Order.countDocuments();
    const apiFeature = new ApiFeatures(Order.find().populate("user","name email"), req.query)
    .search()
    .filter()
    .pagination(itemsPerPage);

    const orders = await apiFeature.query;
  
    let totalAmount = 0;
  
    orders.forEach((order) => {
      totalAmount += order.totalPrice;
    });
  
    res.status(200).json({
      success: true,
      itemsPerPage,
      totalAmount,
      ordersCount,
      orders,
    });
  });

// Update Order Status --Admin
const updateOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }

    if (order.orderStatus === "Delivered") {
        return next(new ErrorHander("You have already delivered this order", 400));
      }
    
      if (req.body.status === "Shipped") {
        order.orderItems.forEach(async (o) => {
          await updateStock(o.product, o.quantity);
        });
      }
       
    order.orderStatus = req.body.status;

    if(req.body.status === "Delivered"){
        order.deliveryAt = Date.now()
    }
    
    await order.save()
    res.status(200).json({
        success: true
      });
})

async function updateStock(id,quantity){
    const product = await Product.findById(id)

    product.stock -= quantity;
    await product.save()
}

// delete Order -- Admin
const deleteOrder = catchAsyncErrors(async (req, res, next) => {
    const order = await Order.findById(req.params.id);
  
    if (!order) {
      return next(new ErrorHander("Order not found with this Id", 404));
    }
  
    await order.deleteOne()
  
    res.status(200).json({
      success: true,
    });
  });

module.exports = {
  createOrder,getSingleOrder,myOrders,getAllOrders,updateOrder,deleteOrder
}