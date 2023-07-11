const express = require("express");
const orderController = require("../controllers/orderController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/order/new").post(isAuthenticatedUser, orderController.createOrder);

router.route("/order/:id").get(isAuthenticatedUser, orderController.getSingleOrder);

router.route("/orders/me").get(isAuthenticatedUser, orderController.myOrders);

router
  .route("/admin/orders")
  .get(isAuthenticatedUser, authorizeRoles("admin"), orderController.getAllOrders);

router
  .route("/admin/order/:id")
  .put(isAuthenticatedUser, authorizeRoles("admin"), orderController.updateOrder)
  .delete(isAuthenticatedUser, authorizeRoles("admin"), orderController.deleteOrder);
module.exports = router;
