const express = require("express");
const router = express.Router();
const userController = require("./userController");
const { authenticateToken } = require("../../middleware/auth");

router.get("/test-db", userController.testDb);
router.post("/lookup-email", userController.lookupEmail);
router.post("/sync-user", userController.syncUser);
router.get("/user/me", authenticateToken, userController.getMe);
router.delete("/user", authenticateToken, userController.deleteMe);
router.post("/user/membership", authenticateToken, userController.toggleMembership);

module.exports = router;
