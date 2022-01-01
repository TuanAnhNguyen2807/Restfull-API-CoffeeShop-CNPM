const isAdmin = (req,res,next)=>{
    req.locals.payload.role == "admin"? next() : res.send("Not admin")
}
const isManager = (req,res,next)=>{
    let roles = ["admin", "manager"]
    roles.includes(req.locals.payload.role) ? next() : res.send("Not manager")
}
const isEmployee = (req,res,next)=>{
    let roles = ["admin", "manager", "employee"]
    roles.includes(req.locals.payload.role) ? next() : res.send("Not employee")
}

module.exports = {isAdmin, isManager, isEmployee};
