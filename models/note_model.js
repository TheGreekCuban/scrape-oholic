const mongoose = require("mongoose")

//Save a reference to the Schema constructor
const Schema = mongoose.Schema

//Using the schema constructor, create a new NoteSchema object, this is similar to the sequelize model
const NoteSchema = new Schema ({
    title: String,
    body: String
})

const Note = mongoose.model("Note", NoteSchema)

module.exports = Note