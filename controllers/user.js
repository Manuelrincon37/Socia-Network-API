//Import modules & dependencies
const bcrypt = require("bcrypt")
const User = require("../models/user")

//import services
const jwt = require("../services/jwt")

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


//Export actions
module.exports = {
    testUser,
    register,
    login
}