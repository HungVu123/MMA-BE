const User = require("../models/userModel");
const ErrorHander = require("../utils/errorhander");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const sendEmail = require("../utils/sendEmail");
const crypto = require("crypto");
const cloudinary = require("cloudinary");
const ApiFeatures = require("../utils/apifeatures");

//Register a user
const registerUser = catchAsyncErrors(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
    avatar: {
      public_id: "this is sample id",
      url: "https://static.vecteezy.com/system/resources/previews/008/442/086/original/illustration-of-human-icon-user-symbol-icon-modern-design-on-blank-background-free-vector.jpg",
    },
    gender: "none",
    birthDate: "1/1/2001",
  });

  sendToken(user, 201, res);
});

// Login a user
const loginUser = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  // Checking if user has a given password and email both

  if (!email || !password) {
    return next(new ErrorHander("Please Enter Email & Password", 400));
  }

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Invalid Email or Password", 401));
  }

  return sendToken(user, 201, res);
});

// Logout user
const logout = catchAsyncErrors(async (req, res, next) => {
  res.cookie("token", null, {
    expires: new Date(Date.now()),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
});

// Forgot Password
const forgotPassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorHander("User Or Email Not Found", 404));
  }

  // Get Reset Password
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  const resetPasswordUrl = `${process.env.FRONTEND_URL}password/reset/${resetToken}`;

  const message = ` <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
  
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
      <link rel="icon" href="images/favicon.png" type="image/x-icon">
  
      <title>Voxo | Email template </title>
  
      <style type="text/css">
          body {
              text-align: center;
              margin: 0 auto;
              width: 650px;
              font-family: 'Public Sans', sans-serif;
              background-color: #e2e2e2;
              display: block;
          }
  
          ul {
              margin: 0;
              padding: 0;
          }
  
          li {
              display: inline-block;
              text-decoration: unset;
          }
  
          a {
              text-decoration: none;
          }
  
          h5 {
              margin: 10px;
              color: #777;
          }
  
          .text-center {
              text-align: center
          }
  
          .header-menu ul li+li {
              margin-left: 20px;
          }
  
          .header-menu ul li a {
              font-size: 14px;
              color: #252525;
              font-weight: 500;
          }
  
          .password-button {
              background-color: #0DA487;
              border: none;
              color: #fff;
              padding: 14px 26px;
              font-size: 18px;
              border-radius: 6px;
              font-weight: 600;
          }
  
          .footer-table {
              position: relative;
          }
  
          .footer-table::before {
              position: absolute;
              content: "";
              background-image: url(images/footer-left.svg);
              background-position: top right;
              top: 0;
              left: -71%;
              width: 100%;
              height: 100%;
              background-repeat: no-repeat;
              z-index: -1;
              background-size: contain;
              opacity: 0.3;
          }
  
          .footer-table::after {
              position: absolute;
              content: "";
              background-image: url(images/footer-right.svg);
              background-position: top right;
              top: 0;
              right: 0;
              width: 100%;
              height: 100%;
              background-repeat: no-repeat;
              z-index: -1;
              background-size: contain;
              opacity: 0.3;
          }
  
          .theme-color {
              color: #0DA487;
          }
      </style>
  </head>
  
  <body>
      <table align="center" border="0" cellpadding="0" cellspacing="0"
          style="box-shadow: 0px 0px 14px -4px rgba(0, 0, 0, 0.2705882353);-webkit-box-shadow: 0px 0px 14px -4px rgba(0, 0, 0, 0.2705882353);">
          <tbody>
              <tr>
                  <td>
                      <table class="contant-table" align="center" border="0" cellpadding="0"
                          cellspacing="0" width="100%">
                          <thead>
                              <tr style="display: block;">
                                  <td style="display: block;">
                                      <h3 style="font-weight: 700; font-size: 20px; margin: 0;text-align: center">Reset Password</h3>
                                  </td>
  
                                  <td style="display: block;">
                                      <h3
                                          style="font-weight: 700; font-size: 20px; margin: 0;color: #939393;">
                                          Hi ${user.name},</h3>
                                  </td>
  
                                  <td>
                                      <p
                                          style="font-size: 17px;font-weight: 600;line-height: 1.5;color: #939393;">
                                          We’re Sending you this email because You requested a password reset. click on
                                          this link to create a new password:</p>
                                  </td>
                              </tr>
                          </thead>
                      </table>
  
                      <table class="button-table" style="margin-top: 27px;" align="center" border="0" cellpadding="0"
                          cellspacing="0" width="100%">
                          <thead>
                              <tr style="display: block;">
                                  <td style="display: block;text-align: center">
                                      <a class="password-button" href="${resetPasswordUrl}" style="color:#fff">Set a new password</a>
                                  </td>
                              </tr>
                          </thead>
                      </table>
  
                      <table class="contant-table" style="margin-top: 27px;" align="center" border="0" cellpadding="0"
                          cellspacing="0" width="100%">
                          <thead>
                              <tr style="display: block;">
                                  <td style="display: block;">
                                      <p
                                          style="font-size: 17px;font-weight: 600;margin: 8px auto 0;line-height: 1.5;color: #939393;">
                                          If you didn’t request a password reset, you can ignore this email. your password
                                          will not be changed.</p>
                                  </td>
                              </tr>
                          </thead>
                      </table>
  
                      <table class="text-center footer-table" align="center" border="0" cellpadding="0" cellspacing="0"
                          width="100%"
                          style="background-color: #282834; color: white; padding: 24px; overflow: hidden; z-index: 0; margin-top: 30px;">
                          <tr>
                              <td>
                                  <table border="0" cellpadding="0" cellspacing="0" class="footer-social-icon text-center"
                                      align="center" style="margin: 8px auto 11px;">
                                      <tr>
                                          <td>
                                              <h4 style="font-size: 19px; font-weight: 700; margin: 0;">Shop For <span
                                                      class="theme-color">Fastkart</span></h4>
                                          </td>
                                      </tr>
                                  </table>
                                  <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                      <tr>
                                          <td>
                                              <h5 style="font-size: 13px; text-transform: uppercase; margin: 10px 0 0; color:#ddd;
                                  letter-spacing:1px; font-weight: 500;">2021-22 copy right </h5>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </tbody>
      </table>
  </body>
  </html>`;

  try {
    await sendEmail({
      email: user.email,
      subject: `Ecommerce Password Recovery`,
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });
    return next(new ErrorHander(error.message, 500));
  }
});

// Reset Password
const resetPassword = catchAsyncErrors(async (req, res, next) => {
  // Creating token hash
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const resetPasswordExpire = { $gt: Date.now() };

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire,
  });

  if (!user) {
    return next(
      new ErrorHander(
        "Reset Password Token is invalid or has been expired",
        400
      )
    );
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(
      new ErrorHander("Password does not same as confirm password", 400)
    );
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  sendToken(user, 200, res);
});

// Get User Detail
const getUserDetail = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Password
const updatePassword = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  const isPasswordMatched = await user.comparePassword(req.body.oldPassword);

  if (!isPasswordMatched) {
    return next(new ErrorHander("Old password is incorrect", 400));
  }

  if (req.body.newPassword !== req.body.confirmPassword) {
    return next(new ErrorHander("Password is not match", 400));
  }

  user.password = req.body.newPassword;

  await user.save();

  sendToken(user, 200, res);
});

// Update User Profile
const updateProfile = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    birthDate: req.body.birthDate,
    gender: req.body.gender,
  };

  //add cloudinary
  if (req.body.avatar !== "") {
    const user = await User.findById(req.user.id);

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

  const user = await User.findByIdAndUpdate(req.user.id, newUserData);

  res.status(200).json({
    success: true,
  });
});

// Create User ShippingInfo
const createShippingInfo = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);

  user.shippingInfos.push(req.body);

  await user.save();

  res.status(200).json({
    success: true,
    user,
  });
});

// Update/Delete User ShippingInfo
const ShippingInfo = catchAsyncErrors(async (req, res, next) => {
  const ShippingInfo = req.body;
  let shippingInfosId = await req.params.id;

  if (Object.keys(ShippingInfo).length === 0) {
    const shippingInfos = await User.findOneAndUpdate(
      { _id: req.user.id },
      {
        $pull: {
          shippingInfos: {
            _id: req.params.id,
          },
        },
      }
    );
  } else {
    const user = await User.findOneAndUpdate(
      { _id: req.user.id, "shippingInfos._id": shippingInfosId },
      {
        $set: {
          "shippingInfos.$": req.body,
        },
      }
    );
  }

  res.status(200).json({
    success: true,
  });
});

// Get All Users (admin)
const getAllUsers = catchAsyncErrors(async (req, res, next) => {
  const itemsPerPage = 8;
  const usersCount = await User.countDocuments();
  const apiFeature = new ApiFeatures(User.find(), req.query)
    .search()
    .filter()
    .pagination(itemsPerPage);

  const users = await apiFeature.query;

  res.status(200).json({
    success: true,
    itemsPerPage,
    usersCount,
    users,
  });
});

// Get Single Users (admin)
const getSingleUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with id ${req.params.id}`)
    );
  }

  res.status(200).json({
    success: true,
    user,
  });
});

// Update User Role (admin)
const updateUserRole = catchAsyncErrors(async (req, res, next) => {
  const newUserData = {
    name: req.body.name,
    email: req.body.email,
    role: req.body.role,
  };

  // We will add cloudinary later
  const user = await User.findByIdAndUpdate(req.params.id, newUserData);

  res.status(200).json({
    success: true,
  });
});

// Delete User (admin)
const deleteUser = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  // We will add cloudinary later

  if (!user) {
    return next(
      new ErrorHander(`User does not exist with id ${req.params.id}`)
    );
  }

  await user.deleteOne();

  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

module.exports = {
  registerUser,
  loginUser,
  logout,
  forgotPassword,
  resetPassword,
  getUserDetail,
  updatePassword,
  updateProfile,
  ShippingInfo,
  getAllUsers,
  getSingleUser,
  updateUserRole,
  deleteUser,
  createShippingInfo,
};
