const express = require("express");
const router = express.Router();
const publicationController = require("../controllers/publication")

//Define routes
router.get("/prueba-publication", publicationController.testPublication)

//Export router
module.exports = router;