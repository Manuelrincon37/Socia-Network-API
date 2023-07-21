//Import model
const publication = require("../models/publication")
const Publication = require("../models/publication")

//Test actions
// const testPublication = (req, res) => {
//     return res.status(200).send({
//         message: "Mensaje enviado desde: controllers/publication.js"
//     })
// }

//Save publication
const save = (req, res) => {

    //Get body data
    let params = req.body
    //Check if body data arrives
    if (!params.text) {
        return res.status(400).send({
            status: "Error",
            message: "Debes enviar el texto de la publicación"
        })
    }
    //Create an fill model object
    let newPublication = new Publication(params)
    newPublication.user = (req.user.id)
    //Save object in DB
    newPublication.save().then((publicationStored) => {
        if (!publicationStored) {
            return res.status(400).send({
                status: "Error",
                message: "No se ha podido guardar la publicacion"
            })
        }

        return res.status(200).send({
            status: "Succes",
            message: "Publicacion guardada con exito",
            publicationStored
        })

    }).catch((error => {
        return res.status(500).send({
            status: "Error",
            message: "Error inesperado del servidor"
        })
    }))
}
//Get one publication

//Delete publications

//List all publications

//List publications by user

//Upload files

//Return multimedia files(images)



//Export actions
module.exports = {
    save
}