const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const check = require("../middlewares/auth")

//Define routes
router.get("/prueba-user", check.auth, userController.testUser)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.get("/profile/:id", check.auth, userController.profile)

//Export router
module.exports = router;