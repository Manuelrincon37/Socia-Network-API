const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow")
const check = require("../middlewares/auth")

//Define routes
// router.get("/prueba-follow", followController.testFollow)
router.post("/save", check.auth, followController.save)
router.delete("/unfollow/:id", check.auth, followController.unfollow)

//Export router
module.exports = router;