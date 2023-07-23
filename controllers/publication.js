//Import model
const { relativeTimeRounding } = require("moment")
const publication = require("../models/publication")
const Publication = require("../models/publication")
//Import dependencies
const fs = require("fs")
const path = require("path")
//Import service
const followService = require("../services/followsService")
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
const detail = (req, res) => {
    //Get publication id form URL
    const publicationId = req.params.id
    //Find id with URL id condition
    Publication.findById(publicationId).then((publicationStored) => {
        if (!publicationStored) {
            return res.status(404).send({
                staatus: "Error",
                message: "No existe publicacion"
            })
        }
        return res.status(200).send({
            status: "Succes",
            message: "mostrar publicacion",
            publicationStored
        })
    }).catch((error) => {
        return res.status(500).send({
            staatus: "Error",
            message: "Error al buscar publicacion"
        })
    })

}

//Delete publications
const remove = (req, res) => {
    //Get id of publication to remove
    const publicationId = req.params.id
    //Find & remove
    Publication.deleteOne({ "user": req.user.id, "_id": publicationId })
        .then((publicationDeleted) => {
            if (!publicationDeleted) {
                res.status(404).send({
                    status: "Error",
                    message: "No se ha encontrado publicacion a eliminar"
                })
            }
            return res.status(200).send({
                status: "Scucces",
                message: "Eliminar publicacion",
                publicationDeleted
            })
        }).catch((error) => {
            return res.status(500).send({
                staatus: "Error",
                message: "Error al eliminar publicacion",
                error
            })
        })
}

//List publications by user
const user = (req, res) => {
    //Get use id by URL params
    const userId = req.params.id
    //Page controll
    let page = 1
    if (req.params.page) page = req.params.page
    const itemsPerpage = 5
    //Find, populate & paginate
    Publication.find({ "user": userId }).sort("-createt_at")
        .populate({ path: "user", select: "-password -role" })
        .paginate(page, itemsPerpage)
        .then(async (publication) => {
            const total = await Publication.countDocuments({}).exec()
            if (publication.length <= 0) {
                return res.status(404).send({
                    status: "Error",
                    message: "No se ha encontrado publicacion"
                })
            }
            return res.status(200).send({
                status: "Scucces",
                message: "Publicaciones de un usuario",
                user: req.user,
                publication,
                page,
                pages: Math.ceil(total / itemsPerpage),
                total_publications: total
            })
        }).catch((error) => {
            return res.status(500).send({
                staatus: "Error",
                message: "Error al mostrar publicaciones"
            })
        })
}
//Return multimedia files(images)
const upload = (req, res) => {
    //Get publication ID
    const publicationId = req.params.id
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
    Publication.findOneAndUpdate({ "user": req.user.id, "_id": publicationId }, { file: req.file.filename }, { new: true }).then(async (publicationUpdated) => {
        if (!publicationUpdated) {
            return res.status(400).send({
                status: "Error",
                message: "Error en la subida del avatar"
            })
        }
        return res.status(200).send({
            status: "Success",
            message: "Subida de imagenes",
            publication: publicationUpdated,
            file: req.file
        })
    }).catch((error) => {
        return res.status(500).send({
            status: "Error",
            message: "Error al subir imagen"

        })
    })
}

//Upload files
const media = (req, res) => {
    //get param from URL
    const file = req.params.file
    //Mount real path of image file
    const filePath = "./uploads/publications/" + file;
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
//List all publications(FEED)
const feed = async (req, res) => {
    //Get actual page
    let page = 1
    //Establish number of items per page
    if (req.params.page) page = req.params.page
    let itemsPerpage = 5
    //Get user Id's that identified user follows
    try {

        const myFollows = await followService.followUserIds(req.user.id)
        //Find publications (in), sort, populate & paginate

        const publications = await Publication.find({ user: { "$in": myFollows.following } })
            .populate({ path: "user", select: "-password -role -__v -email" })
            .sort("-created_at").paginate(page, itemsPerpage).then(async (publications) => {
                const total = await Publication.countDocuments({}).exec()
                if (!publications) {
                    return res.status(404).send({
                        status: "Error",
                        message: "No hay publicaciones para mostrar"
                    })
                }
                return res.status(200).send({
                    status: "Success",
                    message: "Feed de publicaciones",
                    myFollows: myFollows.following,
                    publications,
                    page,
                    pages: Math.ceil(total / itemsPerpage),
                    total_publications: total

                })
            })
    } catch (error) {
        return res.status(500).send({
            status: "Error",
            message: "Error en listar publicaciones",
            error
        })
    }


}
//Export actions
module.exports = {
    save,
    detail,
    remove,
    user,
    upload,
    media,
    feed
}