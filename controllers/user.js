//Import modules & dependencies
const bcrypt = require("bcrypt")
const User = require("../models/user")
const Follow = require("../models/follows")
const mongoosePagination = require("mongoose-pagination")
const fs = require("fs")
const path = require("path")

//import services
const jwt = require("../services/jwt")
const followService = require("../services/followsService")
const validate = require("../helpers/validate")

//Test actions
const testUser = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/user.js",
        usuario: req.user
    })
}

//Register user
const register = (req, res) => {
    //Get petition data
    let params = req.body;
    //Check if arrive correctly and validate
    if (!params.name || !params.email || !params.password || !params.nick) {
        return res.status(400).json({
            status: "error",
            message: "Faltan datos por enviar"
        })
    }
    //Advance validation 
    try {
        validate(params);
    } catch (error) {
        return res.status(400).json({
            status: "error",
            message: "No se ha superado la validacion de los datos"
        })
    }



    //Check duplicate users
    User.find({
        $or: [
            { email: params.email.toLowerCase() },
            { nick: params.nick.toLowerCase() }
        ]
    }).then(async (users) => {

        if (users && users.length >= 1) {
            return res.status(200).send({
                status: "Succsess",
                message: "Usuario ya existe"
            })
        }

        //Cypher password
        let pwd = await bcrypt.hash(params.password, saltRounds = 10)
        params.password = pwd

        //Create User object
        let userToSave = new User(params)

        //Save on DB
        userToSave.save().then((userStored) => {
            if (!userStored) {
                return res.status(500).json({
                    status: "Error",
                    message: "Error al crear usuario "
                })

            }
            //Return result
            return res.status(200).json({
                satus: "Success",
                message: "Usuario registrado correctamente",
                user: userStored
            });
        })
    })
        .catch((error) => {
            return res.status(500).json({
                status: "Error",
                message: "Error en la consulta de usuarios "
            })
        })
}

const login = (req, res) => {
    //Get petition data
    let params = req.body;
    if (!params.email || !params.password) {
        return res.status(404).json({
            status: "Error",
            message: "Faltan datos por enviar"
        })
    }

    //Check if user exist in DB
    User.findOne({ email: params.email })/*.select({ "password": 0 })*/.then((user) => {
        if (!user) {
            return res.status(404).json({
                status: "Error",
                message: "No existe el usuario"
            })
        }

        //Check pasword
        let pwd = bcrypt.compareSync(params.password, user.password);
        if (!pwd) {
            return res.status(400).json({
                status: "Error",
                message: "No te has identificado correctamente"
            })

        }
        //Get token
        const token = jwt.createToken(user);
        //Return user data

        return res.status(200).json({
            status: "Success",
            message: "Te has identificado correctamente",
            user: {
                name: user.name,
                id: user._id,
                nick: user.nick
            },
            token
        });
    })
}

const profile = (req, res) => {
    //Recive id user parms by URL
    const id = req.params.id;
    //Get user data
    User.findById(id).select({ password: 0, role: 0 })
        .then(async (userProfile) => {
            if (!id) {
                return res.sstaus(404).send({
                    status: "Error",
                    message: "Usiario no existe o hay un error"
                })
            }

            //Follows info
            const followInfo = await followService.followThisUser(req.user.id, id)

            //Return result
            return res.status(200).send({
                status: "Success",
                user: userProfile,
                following: followInfo.following,
                follower: followInfo.follower
            })

        }).catch(error => {
            return res.status(500).send({
                status: "Error",
                message: "Server error",
                error
            })
        })
}

const list = (req, res) => {
    //Control actual page by URL
    let parms = 1;
    if (req.params.page) {
        page = req.params.page;
    }
    page = parseInt(page)
    //Make consult with mongoose paginate
    let itemsPerPage = 5;

    User.find().select("-password -email -role -__v").sort("_id")
        .paginate(page, itemsPerPage).then(async (users) => {
            // Get total users
            const totalUsers = await User.countDocuments({});
            if (!users) {
                return res.status(404).send({
                    status: "Error",
                    message: "No se ecnontraron usuarios",
                    error: error
                });
            }
            //Get arrais with ids  of users followed and following as identified user
            let followUserIds = await followService.followUserIds(req.user.id)

            //Return result (then follows info)
            return res.status(200).send({
                status: "Scucces",
                users,
                page,
                itemsPerPage,
                total: totalUsers,
                pages: Math.ceil(totalUsers / itemsPerPage),
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            });
        }).catch(error => {
            return res.status(500).send({
                status: "Error",
                message: "Server error",
                error
            })
        })
}
const update = (req, res) => {
    //Get user data to update
    let userIdentity = req.user
    let userToUpdate = req.body

    //Delete leftover params
    delete userToUpdate.iat
    delete userToUpdate.exp
    delete userToUpdate.role
    delete userToUpdate.image

    //Check if user exist(email||nick)
    User.find({
        $or: [
            { email: userToUpdate.email.toLowerCase() },
            { nick: userToUpdate.nick.toLowerCase() }
        ]
    }).then(async (users) => {
        let userIsset = false
        users.forEach(user => {
            if (user && user._id != userIdentity.id) userIsset = true;
        });
        if (userIsset) {
            return res.status(200).send({
                status: "Succsess",
                message: "Usuario ya existe"
            })
        }

        //If password ---> Encrypt
        if (userToUpdate.password) {
            //Cypher password
            let pwd = await bcrypt.hash(userToUpdate.password, saltRounds = 10)
            userToUpdate.password = pwd
        } else {
            delete userToUpdate.password
        }

        //Find & update user
        try {
            let userUpdated = await User.findByIdAndUpdate(userIdentity.id, userToUpdate, { new: true })
            //Return user updated
            if (!userUpdated) {
                return res.status(404).send({ status: "Error", message: "Error al actualizar los datos" })
            }
            return res.status(200).send({
                status: "Succes",
                message: "Metodo de actualizar usuario",
                user: userUpdated
            })
        } catch (error) {
            return res.status(500).send({
                status: "Error",
                message: "Error al actualizar los datos"
            })
        }
    })
}

const upload = (req, res) => {

    //Pick image file and check if exist
    if (!req.file) {
        return res.status(404).send({
            satus: "Error",
            message: "Peticion no incluye la imagen"
        })
    }

    //Get the file name
    let image = req.file.originalname;

    //Get file extention
    const imageSplit = image.split("\.");
    const extention = imageSplit[1]

    //Check extention
    //If incorrect, delete file.
    if (extention != "png" && extention != "jpg" && extention != "jpeg" && extention != "gif") {
        const filePath = req.file.path
        const fileDeleted = fs.unlinkSync(filePath)
        return res.status(400).send({
            status: "Error",
            messagge: "Extension del fichero invalida"
        })
    }
    //If correct, save image
    User.findOneAndUpdate({ _id: req.user.id }, { image: req.file.filename }, { new: true }).then(async (userUpdated) => {
        if (!userUpdated) {
            return res.status(400).send({
                status: "Error",
                message: "Error en la subida del avatar"
            })
        }

        return res.status(200).send({
            status: "Success",
            message: "Subida de imagenes",
            user: req.user,
            file: req.file
        })

    }).catch((error) => {
        return res.status(500).send({
            status: "Error",
            message: "Error al subir imagen"

        })
    })
}

const avatar = (req, res) => {
    //get param from URL
    const file = req.params.file
    //Mount real path of image file
    const filePath = "./uploads/avatars/" + file;
    //Check if file exist
    fs.stat(filePath, (error, exist) => {
        if (!exist) {
            return res.status(400).send({
                status: "Error",
                message: "No existe la imagen"
            });
        }
        //Return a afile
        return res.sendFile(path.resolve(filePath));
    })
}



//Export actions
module.exports = {
    testUser,
    register,
    login,
    profile,
    list,
    update,
    upload,
    avatar
}