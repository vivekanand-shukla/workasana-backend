const mongoose = require('mongoose');
// Team Schema
const teamSchema = new mongoose.Schema({
 name: { type: String, required: true, unique: true }, // Team names must be unique
 description: { type: String },
 
 // Optional description forthe team

 members:[ { type: mongoose.Schema.Types.ObjectId, ref: 'users', required: true , unique:true } ]

});
module.exports = mongoose.model('Team', teamSchema);