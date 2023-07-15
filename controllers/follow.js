//Test actions
const testFollow = (req, res) => {
    return res.status(200).send({
        message: "Mensaje enviado desde: controllers/follow.js"
    })
}

//Export actions
module.exports = {
    testFollow
}