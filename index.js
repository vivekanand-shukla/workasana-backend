const express = require("express")
const app = express()
const axios = require("axios")
require('dotenv').config();
const cookieParser = require("cookie-parser")
const bodyParser = require('body-parser');
const {connectDb}  = require("./connect/db.connect")
const Project = require("./models/projectschema.models")
const Tag = require("./models/tagschema.models")
const Task = require("./models/Taskschema.models")
const Team = require("./models/teamschema.models")
const mongoose = require('mongoose');  
const User = require("./models/user.models");
const AuthRouter = require('./Routes/AuthRouter')
const  ensureAuthenticated = require("./Middlewares/Auth")
const PORT = process.env.PORT || 3000
const jwt = require("jsonwebtoken");
connectDb()

app.use(bodyParser.json())
app.use(express.json());
const FRONTEND_URL =  process.env.FRONTEND_URI || `https://workasana-frontend-ten.vercel.app` 
// cors 
const cors = require("cors");

const corsOptions = {
  origin: [
    "http://localhost:5173",                      // React local
    "https://workasana-frontend-ten.vercel.app", // Deployed frontend
    "http://localhost:3000"                        // Optional (Next.js etc)
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  optionsSuccessStatus: 200
};
app.use(cookieParser())
app.use(cors(corsOptions));

// =====
app.get("/",(req,res)=>{
    res.json("server is running after / ")
})
//======= AUTH ROUTES =========

app.use('/auth' , AuthRouter )



// ============================
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
app.post("/tasks" , ensureAuthenticated , async(req,res)=>{
    try {
        const {name, project, status, timeToComplete, tags, owners, team , priority} = req.body
        if(name && project && timeToComplete && owners && team){

        
      

                 let savedTask = await addTask({
                name: name,
                project: project,
                status: status,
                timeToComplete: timeToComplete,
                tags: tags ? tags : [],
                owners: owners,
                team: team,
                priority: priority

            })
            if(savedTask ){

                res.status(201).json({message:"successfully saved data", savedTask: savedTask})
             }
                } 
                else {
            res.status(400).json({message:"some fields are missing or not wrong"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get all tasks with filtering
app.get("/tasks",  ensureAuthenticated,  async(req,res)=>{
    try {
        const {team,owner,  tags, project, status , priority} = req.query
        let filter = {}
        
        if(team) filter.team = team
        if(owner) filter.owners = owner
        if(tags) filter.tags = {$in: tags.split(',')}
        if(project) filter.project = project
        if(status) filter.status = status
        if(priority) filter.priority = priority
        
        let tasks = await Task.find(filter)
            .populate('project')
            .populate('team')
            .populate('owners', '-password')
        
        res.status(200).json({tasks: tasks})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})
//get one task
app.get("/tasks/:id",  ensureAuthenticated,  async(req,res)=>{
    try {
       
         const {id} = req.params
        let task = await Task.findById(id)
            .populate('project')
            .populate('team')
            .populate('owners', '-password')
        
        res.status(200).json({task: task})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


// Update a task
app.post( "/tasks/:id", ensureAuthenticated,  async(req,res)=>{
    try {
        const {id} = req.params
        const updateData = req.body
         
          let ae =  await Task.findById(id)
      
        let updatedTask = await Task.findByIdAndUpdate(id, updateData, {new: true})
            .populate('project')
            .populate('team')
            .populate('owners', '-password')
        
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
app.delete("/tasks/:id", ensureAuthenticated,  async(req,res)=>{
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


// Ensure authenticated
app.get(
  "/ensureAuthenticated",
  ensureAuthenticated,
  async (req, res) => {
    res.json({ message: "Authentication Successful" });
  }
);




// ============= TEAM ROUTES =============

// Create new team
app.post("/teams", ensureAuthenticated,  async(req,res)=>{
    try {
        const {name, description ,members} = req.body
       
        if(name){
            let newTeam = new Team({
                name: name,
                description: description,
                members: members

            })
            let savedTeam = await newTeam.save();
            res.status(201).json({message:"team created successfully", team: savedTeam})
        } else {
            res.status(400).json({message:"name field is required"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})
// Upadte team member
app.put("/teams/:id", ensureAuthenticated,  async(req,res)=>{
    try {
        const updateData = req.body
        const {id} = req.params
        if( id &&  updateData){ 
            let savedTeam = await Team.findByIdAndUpdate(id, updateData, {new: true}).populate("members", "name email");
            res.status(201).json({message:"team updated  successfully", team: savedTeam})
        } else {
            res.status(404).json({message:"Id not found or update data not present"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})
// delete team
app.delete("/teams/:id", ensureAuthenticated,  async(req,res)=>{
    try {
        
        const {id} = req.params
        if( id ){ 
            let savedTeam = await Team.findByIdAndDelete(id)
            res.status(201).json({message:"team deleted  successfully", team: savedTeam})
        } else {
            res.status(404).json({message:"Id not found "})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// dekete a member 

// Remove a member from team
app.delete("/teams/:teamId/members/:userId", ensureAuthenticated, async (req, res) => {
  try {
    const { teamId, userId } = req.params;

    const team = await Team.findByIdAndUpdate(
      teamId,
      { $pull: { members: userId } },
      { new: true }
    ).populate("members", "name email");

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ message: "Member removed", team });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Get all teams
app.get("/teams", ensureAuthenticated,  async(req,res)=>{
    try {
        let teams = await Team.find().populate('members', '-password')
        res.status(200).json({teams: teams})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})
// Get one teams
app.get("/teams/:id", ensureAuthenticated,  async(req,res)=>{
     const {id} = req.params
    try {
        let team = await Team.findById(id).populate('members', '-password')
        res.status(200).json({team: team})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


// ============= PROJECT ROUTES =============


// Create new project
app.post("/projects", ensureAuthenticated,  async(req,res)=>{
    try {
      
        const {name, description ,status} = req.body
        if(name){
            let newProject = new Project({
                name: name,
                description: description,
                status :status
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
app.get("/projects", ensureAuthenticated , async(req,res)=>{
    try {
        let projects = await Project.find()
        res.status(200).json({projects: projects})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})


// Delete a project
app.delete("/projects/:id", ensureAuthenticated, async(req,res)=>{
    try {
        const {id} = req.params
        let deletedProject = await Project.findByIdAndDelete(id)
        
        if(deletedProject){
            res.status(200).json({message:"project deleted successfully", project: deletedProject})
        } else {
            res.status(404).json({message:"project not found"})
        }
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})



// ============= TAG ROUTES =============

// Create new tag
app.post("/tags", ensureAuthenticated,  async(req,res)=>{
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
app.get("/tags", ensureAuthenticated,  async(req,res)=>{
    try {
        let tags = await Tag.find()
        res.status(200).json({tags: tags})
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// ============= REPORT ROUTES =============

// Get tasks completed last week
app.get("/report/last-week", async(req,res)=>{
    try {
        let oneWeekAgo = new Date()
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
        
        let completedTasks = await Task.find({
            status: 'Completed',
            updatedAt: {$gte: oneWeekAgo}
        })
        .populate('project')
        .populate('team')
        .populate('owners' , '-password')
        
        res.status(200).json({
            message:"tasks completed last week",
            count: completedTasks.length,
            tasks: completedTasks
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get total pending work
app.get("/report/pending", async(req,res)=>{
    try {
        let pendingTasks = await Task.find({
            status: {$ne: 'Completed'}
        })
        
        let totalDays = pendingTasks.reduce((sum, task) => {
            return sum + task.timeToComplete
        }, 0)
        
        res.status(200).json({
            message:"total pending work",
            totalDays: totalDays,
            taskCount: pendingTasks.length
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

// Get closed tasks statistics
app.get("/report/closed-tasks", async(req,res)=>{
    try {
        let completedTasks = await Task.find({status: 'Completed'})
            .populate('team')
            .populate('project')
            .populate('owners', '-password')
        
        // Group by team
        let byTeam = {}
        completedTasks.forEach(task => {
            let teamName = task.team ? task.team.name : 'No Team'
            byTeam[teamName] = (byTeam[teamName] || 0) + 1
        })
        
        // Group by project
        let byProject = {}
        completedTasks.forEach(task => {
            let projectName = task.project ? task.project.name : 'No Project'
            byProject[projectName] = (byProject[projectName] || 0) + 1
        })
        
        // Group by owner
        let byOwner = {}
        completedTasks.forEach(task => {
            task.owners.forEach(owner => {
                let ownerName = owner.name
                byOwner[ownerName] = (byOwner[ownerName] || 0) + 1
            })
        })
        
        res.status(200).json({
            message:"closed tasks statistics",
            totalClosed: completedTasks.length,
            byTeam: byTeam,
            byProject: byProject,
            byOwner: byOwner
        })
    } catch (error) {
        res.status(500).json({error: error.message})
    }
})

//new code 
//
//

function verifyAccessToken(req,res,next){
if(!req.cookies.access_token){
    return res.status(403).json({error: "Access Denined"})
}
next()
}


// app.get("/user/profile/github", verifyAccessToken, async (req,res)=>{
//     try {

//         const  { access_token } = req.cookies
//         const githubUserDatatResponse = await axios.get("https://api.github.com/user" , {
//             headers:{
//                 Authorization:`Bearer ${access_token}`
//             }
//         })
        
//         res.json({user : githubUserDatatResponse.data })
//     } catch (error) {
//         res.status(500).json({error:"Could not fetch user Github profile"})
        
//     }
// })

app.get("/auth/github" , (req,res)=>{
    const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${process.env.GITHUB_CLIENT_ID}&scope=user,repo,security_events`

    res.redirect(githubAuthUrl)

})

app.get('/auth/github/callback' ,async(req,res)=>{
    const{ code }= req.query
          
    if(!code){
        return res.status(400).send("Auterization code is not provided")
    }

    try {
        const tokenResponse = await axios.post("https://github.com/login/oauth/access_token" ,{
            client_id : process.env.GITHUB_CLIENT_ID,
            client_secret : process.env.GITHUB_CLIENT_SECRET,
            code
        },
    {headers:
   { 

    Accept:"application/json" 
   }

    }

)
const accessToken = tokenResponse.data.access_token

//new 


  // Step 2: Get GitHub user info
    const userResponse = await axios.get(
      "https://api.github.com/user",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    )

    const githubUser = userResponse.data


    //
    let email = githubUser.email;

if (!email) {
  const emailRes = await axios.get(
    "https://api.github.com/user/emails",
    {
      headers: { Authorization: `Bearer ${accessToken}` }
    }
  );

  const primaryEmail = emailRes.data.find(e => e.primary);
  email = primaryEmail?.email;
}

    //

    // Step 3: Save to DB
    let user = await User.findOne({ email: email })

    if (!user) {
      user = await User.create({
        name: githubUser.name || githubUser.login,
        email: githubUser.email || email,
        picture: githubUser.avatar_url,
        provider: "github"
      })
    }
//



// res.cookie("access_token",accessToken )
// setSecureCookie(res ,accessToken)
// return res.redirect(`${FRONTEND_URL}/v2/profile/github`)

const jwtToken = jwt.sign(
  { email: user.email, _id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

return res.redirect(
  `${process.env.FRONTEND_URL}/oauth-success?token=${jwtToken}`
);


    } catch (error) {
        res.status(500).json(error)
        
    }
})






// app.get("/user/profile/google", verifyAccessToken, async (req,res)=>{
//     try {

//         const  {access_token } = req.cookies
//         const googleUserDatatResponse = await axios.get("https://www.googleapis.com/oauth2/v2/userinfo",{
//             headers:{
//                 Authorization:`Bearer ${access_token}`
//             }
//         })
        
//         res.json({user : googleUserDatatResponse.data })
//     } catch (error) {
//         res.status(500).json({error:"Could not fetch user Google profile"})
        
//     }
// })

app.get("/auth/google" , (req,res)=>{
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/auth?client_id=${process.env.GOOGLE_CLIENT_ID}&redirect_uri=http://localhost:${process.env.PORT}/auth/google/callback&response_type=code&scope=profile email`

    res.redirect(googleAuthUrl)
})

app.get("/auth/google/callback", async(req,res)=>{
    //   console.log("QUERY:", req.query)
    const {code} = req.query
    
    if(!code){
        return res.status(400).send("Auterization code is not provided")
    }
    let accessToken ;


    try {

        
       const tokenResponse = await axios.post("https://oauth2.googleapis.com/token" ,{
         client_id:process.env.GOOGLE_CLIENT_ID,
         client_secret: process.env.GOOGLE_CLIENT_SECRET,
         code,
         grant_type: 'authorization_code',
         redirect_uri:`https://workasana-backend-gold.vercel.app/auth/google/callback` //here the issue
       }
    //    ,{
    //     headers:{
    //          "Content-Type": "application/x-www-form-urlencoded",
    //     }
    //    }
    
    )


    accessToken = tokenResponse.data.access_token
    // setSecureCookie(res ,accessToken)
    
    
    const userRes = await axios.get(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
      headers: {
        Authorization: `Bearer ${accessToken}`
    }
}
)
  const googleUser = userRes.data

    // Step 3: Save to DB
    let user = await User.findOne({ email: googleUser.email })
    
    if (!user) {
        user = await User.create({
            name: googleUser.name,
            email: googleUser.email ,
            picture: googleUser.picture,
      provider: "google"
    })
}
// res.cookie("access_token", accessToken)





const jwtToken = jwt.sign(
  { email: user.email, _id: user._id },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

// Redirect with JWT
return res.redirect(
  `${process.env.FRONTEND_URL}/oauth-success?token=${jwtToken}`
);

// return res.redirect(`${FRONTEND_URL}/v2/profile/google`)

    } catch (error) {

         console.error(error)
         return res.status(500).send("Authentication failed" , error)
    }

})



//
//
//new code end

app.listen(PORT,()=>{
    console.log("server is running on http://localhost:3000/")
})