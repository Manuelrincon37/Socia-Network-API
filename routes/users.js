const express = require("express");
const multer = require("multer");
const router = express.Router();
const userController = require("../controllers/user");
const check = require("../middlewares/auth")

//Upload config
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./uploads/avatars")
    },
    filename: (req, file, cb) => {
        cb(null, "avatar-" + Date.now() + "-" + file.originalname)
    }
})
const uploads = multer({ storage: storage })
//Define routes
router.get("/prueba-user", check.auth, userController.testUser)
router.post("/register", userController.register)
router.post("/login", userController.login)
router.get("/profile/:id", check.auth, userController.profile)
router.get("/list/:page?", check.auth, userController.list)
router.put("/update", check.auth, userController.update)
router.post("/upload", [check.auth, uploads.single("file0")], userController.upload)
//Export router
module.exports = router;