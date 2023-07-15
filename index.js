//Import dependencies
const { connection } = require("./database/connection")
const express = require("express");
const cors = require("cors")

//Node app start greeting
console.log("API node para red social iniciada");

//Connection to DB
connection();

//Create Node server
const app = express();
const port = 3900

//Config cors
app.use(cors())

//Convert body data to JS Objects
app.use(express.json());
app.use(express.urlencoded({ extended: true }))

//Load routes config
const userRoutes = require("./routes/users")
const publicationRoutes = require("./routes/publication")
const followRoutes = require("./routes/follow");

app.use("/api/user", userRoutes)
app.use("/api/publication", publicationRoutes)
app.use("/api/follow", followRoutes)

//Test route
app.get("/ruta-prueba", (req, res) => {
    return res.status(200).json({
        status: "success",
        mensaje: "Ruta de prueba"
    })
})

//listen HTTP Requests
app.listen(port, () => {
    console.log("Servidor de node corriendo en el puerto: ", port);
})