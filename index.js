const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const {connection} = require("./config/db");
const employeeModel = require("./models/Employee.model");
const userModel = require("./models/User.model");

const PORT = process.env.PORT;

const app = express();

app.use(cors({
    origin: "*"
}))

app.use(express.json());

app.post("/signup", (req, res) => {
    const {email, password, confirmPassword} = req.body;
    if(password !== confirmPassword) {
        return res.send({message: "Passwords don't match"});
    }
    else {
        try {
            bcrypt.hash(password, 5, function(err, hash) {
                userModel.create({email, password : hash});
                console.log("User created successfully");
                res.send({message: "User created successfully"});
            });
        } catch (error) {
            console.log("Error creating user! Try again!");
            res.send({message: "Error creating user! Try again!"});
        }
    }
})

app.post("/login", async (req, res) => {
    const {email, password} = req.body;
    const user = await userModel.findOne({email});
    if(!user) {
        return res.send({message: "User not registered"});
    }
    const hash = user.password;

    bcrypt.compare(password, hash, function(err, result) {
        if(result) {
            const token = jwt.sign({ userID : user._id }, process.env.JWT_SECRET_ALGORITHM);
            console.log(token);
            localStorage.setItem("token", token);
            res.send({message: "Login Successful", token: token});
        }
        else if(err) {
            res.send({message: "Invalid Credentials"});
        }
    });
})

app.post("/employees", async (req, res) => {
    const {firstName, lastName, email, department, salary} = req.body;
    await employeeModel.create({firstName, lastName, email, department, salary});
    res.send({message: "Employee added successfully!"});
})

app.get("/employees", async (req, res) => {
    const employees = await employeeModel.find(req.query);
    res.send({employees: employees});
})

app.listen(PORT, async () => {
    try {
        await connection;
        console.log("Connected to MongoDB successfully");
    } catch (error) {
        console.log("Error connection to MongoDB");
        console.log(error);
    }
    console.log(`Listening on port ${PORT}`)
})

/*

API contract 

POST /signup
POST /login
GET /employees
*/