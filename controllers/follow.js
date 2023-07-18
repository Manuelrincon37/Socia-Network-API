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
const unfollow = (req, res) => {
    //Get id of identified user
    const userId = req.user.id
    //Get followed user id to unfollow
    const followedId = req.params.id
    //Find all coincidences
    Follow.deleteOne({
        "user": userId,
        "followed": followedId
    }).then((followDeleted) => {

        if (!followDeleted) {
            return res.status(500).send({
                status: "Error",
                message: "No se ha dejado de seguir al usuario..."
            })
        }
        return res.status(200).send({
            status: "Scucces",
            message: "Follow eliminado correctamente",
            identity: req.user,
            followDeleted
        })
    }).catch((error) => {
        return res.status(500).send({
            status: "Error",
            message: "No se ha dejado de seguir al usuario..."
        })
    })
    //Execute remove

}
//Export actions
module.exports = {
    save,
    unfollow
}