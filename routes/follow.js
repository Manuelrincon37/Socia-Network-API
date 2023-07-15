const express = require("express");
const router = express.Router();
const followController = require("../controllers/follow")

//Define routes
router.get("/prueba-follow", followController.testFollow)

//Export router
module.exports = router;