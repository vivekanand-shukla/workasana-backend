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
const PORT = process.env.PORT || 3000

app.get("/",(req,res)=>{
    res.json("server is running after / ")
})


async function addTask(newTask){
    try {
        let taskValue = new Task(newTask);
        let save = await taskValue.save()
        return save
    } catch (error) {
        return error
    }
}

// ============= TASK ROUTES =============

// Create new task
app.post("/tasks", async(req,res)=>{
    try {
        const {name, project, status, timeToComplete, tags, owners, team} = req.body
        if(name && project && timeToComplete && owners && team){
            let savedTask = await addTask({
                name: name,
                project: project,
                status: status,
                timeToComplete: timeToComplete,
                tags: tags ? tags : [],
                owners: owners,
                team: team
            })
            res.status(201).json({message:"successfully saved data", savedTask: savedTask})
        } else {
            res.status(400).json({message:"some fields are missing or not wrong"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get all tasks with filtering
app.get("/tasks", async(req,res)=>{
    try {
        const {team, owner, tags, project, status} = req.query
        let filter = {}
        
        if(team) filter.team = team
        if(owner) filter.owners = owner
        if(tags) filter.tags = {$in: tags.split(',')}
        if(project) filter.project = project
        if(status) filter.status = status
        
        let tasks = await Task.find(filter)
            .populate('project')
            .populate('team')
            .populate('owners')
        
        res.status(200).json({tasks: tasks})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


// Update a task
app.post( "/tasks/:id", async(req,res)=>{
    try {
        const {id} = req.params
        const updateData = req.body
        
        let updatedTask = await Task.findByIdAndUpdate(id, updateData, {new: true})
            .populate('project')
            .populate('team')
            .populate('owners')
        
        if(updatedTask){
            res.status(200).json({message:"task updated successfully", task: updatedTask})
        } else {
            res.status(404).json({message:"task not found"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Delete a task
app.delete("/tasks/:id", async(req,res)=>{
    try {
        const {id} = req.params
        let deletedTask = await Task.findByIdAndDelete(id)
        
        if(deletedTask){
            res.status(200).json({message:"task deleted successfully", task: deletedTask})
        } else {
            res.status(404).json({message:"task not found"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})



// ============= TEAM ROUTES =============

// Create new team
app.post("/teams", async(req,res)=>{
    try {
        const {name, description} = req.body
        if(name){
            let newTeam = new Team({
                name: name,
                description: description
            })
            let savedTeam = await newTeam.save()
            res.status(201).json({message:"team created successfully", team: savedTeam})
        } else {
            res.status(400).json({message:"name field is required"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get all teams
app.get("/teams", async(req,res)=>{
    try {
        let teams = await Team.find()
        res.status(200).json({teams: teams})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


// ============= PROJECT ROUTES =============


// Create new project
app.post("/projects", async(req,res)=>{
    try {
        const {name, description} = req.body
        if(name){
            let newProject = new Project({
                name: name,
                description: description
            })
            let savedProject = await newProject.save()
            res.status(201).json({message:"project created successfully", project: savedProject})
        } else {
            res.status(400).json({message:"name field is required"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get all projects
app.get("/projects", async(req,res)=>{
    try {
        let projects = await Project.find()
        res.status(200).json({projects: projects})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})






// ============= TAG ROUTES =============

// Create new tag
app.post("/tags", async(req,res)=>{
    try {
        const {name} = req.body
        if(name){
            let newTag = new Tag({
                name: name
            })
            let savedTag = await newTag.save()
            res.status(201).json({message:"tag created successfully", tag: savedTag})
        } else {
            res.status(400).json({message:"name field is required"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get all tags
app.get("/tags", async(req,res)=>{
    try {
        let tags = await Tag.find()
        res.status(200).json({tags: tags})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


// ============= REPORT ROUTES =============

// Get tasks completed last week


// Get total pending work

// Get closed tasks statistics


app.listen(PORT,()=>{
    console.log("server is running on http://localhost:3000/")
})