const isAdmin = (req,res,next)=>{
    req.locals.payload.role == "admin"? next() : res.status(401).send("Not admin")
}
const isManager = (req,res,next)=>{
    let roles = ["admin", "manager"]
    roles.includes(req.locals.payload.role) ? next() : res.status(401).send("Not manager")
}
const isEmployee = (req,res,next)=>{
    let roles = ["admin", "manager"]
    req.locals.payload.employeeId == req.params.employeeId || roles.includes(req.locals.payload.role) ? next() : res.status(401).send("Not employee")
}

module.exports = {isAdmin, isManager, isEmployee};
