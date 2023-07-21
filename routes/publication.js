const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publication")
const check = require("../middlewares/auth")

//Define routes
// router.get("/prueba-publication", publicationController.testPublication)
router.post("/save", check.auth, publicationController.save)
//Export router
module.exports = router;