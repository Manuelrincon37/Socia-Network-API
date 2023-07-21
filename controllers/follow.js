//Import model
const Follow = require("../models/follows");
const user = require("../models/user");
const User = require("../models/user")
//Import dependencies
const mongoosePaginate = require("mongoose-pagination")
//Import Service
const followService = require("../services/followsService")
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

    //Find all coincidences &Execute remove
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
}
//List of users any other user follows (Following)
const following = (req, res) => {
    //Get identified user id
    let userId = req.user.id;
    //Check if recived id in URL params
    if (req.params.id) userId = req.params.id
    //Check if recived page, else page 1
    let page = 1
    if (req.params.page) page = req.params.page
    //Users per page to show
    let itemsPerPage = 5;
    //Find follow, populate data users and paginate with mongoose
    Follow.find({ user: userId }).populate({ path: "user followed", select: "-password -role -__v" })
        .paginate(page, itemsPerPage)
        .then(async (follows) => {

            //Get arrais with ids  of users followed and following as identified user
            let followUserIds = await followService.followUserIds(req.user.id)

            const total = await Follow.countDocuments({}).exec()

            if (!follows) {
                return res.status(404).send({
                    status: "Error",
                    message: "No se han encontrado resultados"
                })
            }
            return res.status(200).send({
                status: "Success",
                message: "Listado de usuarios que yo sigo",
                follows,
                page,
                pages: Math.ceil(total / itemsPerPage),
                itemsPerPage,
                totalFollows: total,
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            })
        }).catch((error) => {
            return res.status(500).send({
                status: "Error",
                message: "Ha ocurrido un error",
                error: error
            })
        })
}
//List all users following all other users (Followers
const followers = (req, res) => {
    //Get identified user id
    let userId = req.user.id;
    //Check if recived id in URL params
    if (req.params.id) userId = req.params.id
    //Check if recived page, else page 1
    let page = 1
    if (req.params.page) page = req.params.page
    //Users per page to show
    let itemsPerPage = 5;

    Follow.find({ followed: userId }).populate({ path: "user followed", select: "-password -role -__v" })
        .paginate(page, itemsPerPage)
        .then(async (follows) => {

            //Get arrais with ids  of users followed and following as identified user
            let followUserIds = await followService.followUserIds(req.user.id)

            const total = await Follow.countDocuments({}).exec()

            if (!follows) {
                return res.status(404).send({
                    status: "Error",
                    message: "No se han encontrado resultados"
                })
            }
            return res.status(200).send({
                status: "Success",
                message: "Listado de usuarios que me siguen",
                follows,
                page,
                pages: Math.ceil(total / itemsPerPage),
                itemsPerPage,
                totalFollows: total,
                user_following: followUserIds.following,
                user_follow_me: followUserIds.followers
            })
        }).catch((error) => {
            return res.status(500).send({
                status: "Error",
                message: "Ha ocurrido un error",
                error: error
            })
        })
}
//Export actions
module.exports = {
    save,
    unfollow,
    following,
    followers
}