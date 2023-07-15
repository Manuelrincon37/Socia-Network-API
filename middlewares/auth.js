//Import modules
const jwt = require("jwt-simple");
const moment = require("moment")

//Import Secret key
const libjwt = require("../services/jwt");
const secret = libjwt.secret;

//Auth function
exports.auth = (req, res, next) => {

    //Check if auth header is recived
    if (!req.headers.authorization) {
        res.status(403).send({
            status: "Error",
            mesagge: "La peticion no tiene la cabecera de autenticacion"
        });
    }
    //Clean token
    let token = req.headers.authorization.replace(/['"]+/g, '')

    //Decrytp Token
    try {
        let payLoad = jwt.decode(token, secret);

        //Check token expiration
        if (payLoad.exp <= moment().unix()) {
            return res.status(401).send({
                status: "Error",
                message: "Token expirado"
            })
        }
        //Add user data to request
        req.user = payLoad;

    } catch (error) {
        return res.status(404).send({
            status: "Error",
            message: "Token invalido",
            error
        })
    }

    //Execute action
    next();
}



