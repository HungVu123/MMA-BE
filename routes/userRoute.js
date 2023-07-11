const express = require("express");
const userController = require("../controllers/userController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/register").post(userController.registerUser);

router.route("/login").post(userController.loginUser);

router.route("/password/forgot").post(userController.forgotPassword);

router.route("/password/reset/:token").put(userController.resetPassword);

router.route("/logout").get(userController.logout);

router.route("/me").get(isAuthenticatedUser, userController.getUserDetail);

router
  .route("/password/update")
  .put(isAuthenticatedUser, userController.updatePassword);

router
  .route("/me/update")
  .put(isAuthenticatedUser, userController.updateProfile);

  router
  .route("/shippinginfo/new")
  .put(isAuthenticatedUser, userController.createShippingInfo);

  router
  .route("/shippinginfo/:id")
  .put(isAuthenticatedUser, userController.ShippingInfo)

router
  .route("/admin/users")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    userController.getAllUsers
  );

router
  .route("/admin/user/:id")
  .get(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    userController.getSingleUser
  )
  .put(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    userController.updateUserRole
  )
  .delete(
    isAuthenticatedUser,
    authorizeRoles("admin"),
    userController.deleteUser
  );


module.exports = router;
