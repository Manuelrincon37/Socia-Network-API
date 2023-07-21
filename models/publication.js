const { Schema, model } = require("mongoose")

const PulicationSchema = Schema({
    user: {
        type: Schema.ObjectId,
        ref: "User"
    },
    text: {
        type: "String",
        requiref: true
    },
    file: String,
    createt_at: {
        type: Date,
        default: Date.now
    }

})

module.exports = model("Publication", PulicationSchema, "publications")