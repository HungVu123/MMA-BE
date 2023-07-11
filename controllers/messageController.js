const Message = require("../models/messageModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//Add Message
const addMessage = catchAsyncErrors(async (req, res, next) => {
  const { from, to, message } = req.body;
  const data = await Message.create({
    message: { text: message },
    users: [from, to],
    sender: from,
  });

  if (!data) {
    return next(new ErrorHander("Failed to add message to the database", 401));
  }

  res.status(200).json({
    success: true,
    msg: "Message added successfully.",
  });
});

//Get All Message
const getAllMessage = catchAsyncErrors(async (req, res, next) => {
  const { from, to } = req.body;
  const messages = await Message.find({
    users: {
      $all: [from, to],
    },
  }).sort({ updatedAt: 1 });

  const projectedMessages = messages.map((msg) => {
    return {
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
    };
  });

  res.status(200).json({
    success: true,
    projectedMessages,
  });
});

module.exports = {
  addMessage,
  getAllMessage,
};
