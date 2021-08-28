const routes = require("express").Router();
const mydb = require('../db/index');
const auth = require('../auth/auth');
const bcrypt = require('bcrypt')
//const bcrypt = require("bcrypt");
//const crypto = require("crypto");
//const nodemailer = require("nodemailer");

routes.post("/proba", async (req,res) => {
    // res.send(await mydb.all())
    console.log(req.body)
    // console.log(req.body.FirstName)
    res.send(await mydb.proba(req.body))
})

routes.post('/updateData', async (req, res) => {
    res.send(mydb.updateData(req.body))
})

routes.post("/tableAll", async (req,res) => {
    res.send(await mydb.tableAll())
})

routes.post("/add", async (req,res) => {
    console.log(req.body)
    // console.log(JSON.stringify(req.body))
    res.send(await mydb.add(req.body));
})
routes.post('/auth', async (req, res) => {
    var userEmail = await mydb.readSession(req.headers.authorization);
    if(userEmail){
        var userRole = await mydb.readUserRole(userEmail);
        var name = new Object(await mydb.readUserName(userEmail));
        name.isAuth = true;
        name.role = userRole.role;
        res.send(name);
    } else {
        res.send({error: "Authorization failet!"})
    }
})

routes.post("/manage", async (req,res) => {
    console.log(req.body)
    res.send(await mydb.manage(req.body));
})

routes.post("/register", async (req,res) =>{
    const salt = await bcrypt.genSalt(10);
    req.body[4] = await bcrypt.hash(req.body[4], salt);
    res.send(await mydb.register(req.body));
})

routes.post("/login", async(req,res) =>{
   
    var data = await mydb.login(req)
    if(data !== undefined){
        var token = await auth.createToken({req,res}); 
        if(token != 0){
            await mydb.writeSession(token, req.body[0]);
        }
        res.send(token);
    } else {
        res.send({
            Error:"Authentification failed!"
        })
    }

})
routes.get("/logout", async(req,res) =>{
    var check = await mydb.deleteSession(req.headers['authorization']);
    if(check){
        res.status(200)
        res.send({eror:false})
    }
})
routes.get("/test", async(req,res) => {
    req.session.isAuth = true
    res.send({authed:'authed'})
})
routes.get("/excelData", async(req, res) => {
    res.send(await mydb.excelInsert()) //fali req.path
})

routes.get('/user-list', function(req, res) {
    res.render('../views/user-list', { title: 'User List', userData: mydb.proba()});
});

module.exports = routes;