const express = require("express");
const messageController = require("../controllers/messageController");
const { isAuthenticatedUser, authorizeRoles } = require("../middleware/auth");
const router = express.Router();

router.route("/addmsg").post(isAuthenticatedUser, messageController.addMessage);

router
  .route("/getmsg")
  .post(isAuthenticatedUser, messageController.getAllMessage);

module.exports = router;
