const express = require("express")
const app = express()
const {connectDb}  = require("./connect/db.connect")
connectDb()
app.use(express.json());
const Project = require("./models/projectschema.models")
const Tag = require("./models/tagschema.models")
const Task = require("./models/Taskschema.models")
const Team = require("./models/teamschema.models")
const User = require("./models/userschema.models")


async function addTask( newTask){
 let taskValue =  new Task(newTask);
 let save = await taskValue.save()
 return save
}

app.post("/addTask" , (req,res)=>{
    
})




























