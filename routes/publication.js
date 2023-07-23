const express = require("express");
const router = express.Router();
const multer = require("multer")
const publicationController = require("../controllers/publication")
const check = require("../middlewares/auth")

//Upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/publications")
    },
    filename: (req, file, cb) => {
        cb(null, "pub-" + Date.now() + "-" + file.originalname)
    }
})
const uploads = multer({ storage: storage })

//Define routes
// router.get("/prueba-publication", publicationController.testPublication)
router.post("/save", check.auth, publicationController.save)
router.get("/detail/:id", check.auth, publicationController.detail)
router.delete("/remove/:id", check.auth, publicationController.remove)
router.get("/user/:id/:page?", check.auth, publicationController.user)
router.post("/upload/:id", [check.auth, uploads.single("file0")], publicationController.upload)
router.get("/media/:file", check.auth, publicationController.media)
router.get("/feed/:page?", check.auth, publicationController.feed)

//Export router
module.exports = router;