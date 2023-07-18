//Import model
const Follow = require("../models/follows")
const User = require("../models/user")

//Test actions
// const testFollow = (req, res) => {
//     return res.status(200).send({
//         message: "Mensaje enviado desde: controllers/follow.js"
//     })
// }

const save = (req, res) => {

    // Get body params  
    const params = req.body;
    //Pull user id 
    const identiy = req.user;
    //Create object using follow model
    let userToFollow = new Follow({
        user: identiy.id,
        followed: params.followed
    });

    //Save object in DB

    userToFollow.save().then((followStored) => {

        if (!followStored) {
            return res.status(500).send({
                status: "Error",
                message: "No se ha podido seguir al usuario"
            })
        }

        return res.status(200).send({
            status: "Scucces",
            message: "Metodo de dar follow",
            identity: req.user,
            userToFollow
        })
    }).catch((error) => {
        return res.status(500).send({
            status: "Error",
            message: "No se ha podido seguir al usuario"
        })
    })


}

//Export actions
module.exports = {
    save
}