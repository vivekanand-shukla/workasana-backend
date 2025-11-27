const mongoose = require('mongoose')
require('dotenv').config()
const mongoUri = process.env.MONGODB

async function connectDb(){
  await  mongoose.connect(mongoUri).then(()=>{console.log("database connected") }).catch((e)=> console.log("an error   occured"))
}
module.exports = {  connectDb  }