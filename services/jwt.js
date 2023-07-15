//Import dependencies
const jwt = require("jwt-simple");
const moment = require("moment")

//Secret Key
const secret = "SECRET_KEY_del_proyecto_DE_LA_RED_soCIAL_987987";

//Create Token generetor Function
const createToken = (user) => {
    const payLoad = {
        id: user._id,
        name: user.name,
        surname: user.surname,
        nick: user.nick,
        email: user.email,
        role: user.role,
        image: user.image,
        iat: moment().unix(),
        exp: moment().add(30, "days").unix()
    };

    //Return crypted jwt token
    return jwt.encode(payLoad, secret);
}
module.exports = {
    secret,
    createToken
}