"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
// server imports
const express = require("express");
const app = express();
const env = require("dotenv");
env.config();
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT;
const secret = process.env.secret;
//model imports
const { User } = require("./models/Users");
const { hashPassword, comparePasswords } = require("./utils/Encryption/EncryptionHandler");
app.use(express.json());
app.get('/v1/user', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO get users from users-ms
    console.log("Get users: ", req.body);
    res.json({ message: "Get" });
}));
app.get('/v1/user/dummy', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.json({
        areaCode: "+52",
        phoneNumber: "222 956 7243",
        firstName: "Don Quijote",
        lastName: "De la Mancha",
        role: "Admin",
        email: "donQ@quijote.com",
        password: "5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
        birthdate: "2024-01-18"
    });
}));
app.post('/v1/register', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //TODO post an user to users-ms
    const data = req.body;
    if (!data.areaCode || !data.phoneNumber || !data.firstName || !data.lastName || !data.role || !data.email || !data.password || !data.birthdate) {
        return res.status(400).json({
            message: "Bad JSON body syntax, verify with attached",
            correctSyntax: [
                {
                    areaCode: 'your-area-phone-code',
                    phoneNumber: 'your-phone-number',
                    firstName: 'your-first-name',
                    lastName: 'your-last-name',
                    role: 'your-role',
                    email: 'your-email',
                    password: "your-secret-passwprd",
                    birthdate: "yyyy-MM-dd"
                }
            ]
        });
    }
    try {
        const newUser = new User(data);
        res.json({ message: "Post" });
    }
    catch (e) {
        const timestamp = new Date().toString();
        console.log("Catched error message ", timestamp);
        res.statusMessage = "Error ocurred during POST";
        res.status(400).json({
            message: e.message
        });
    }
}));
app.post('/v1/register/patient', (req, res) => {
});

/*
app.put('/users', (req: request, res: response) => {
    //TODO post an user to users-ms
    console.log("Post users: ", req.body)
    res.json({ message: "Put" })
})
app.delete('/users', (req: request, res: response) => {
    //TODO post an user to users-ms
    console.log("Post users: ", req.body)
    res.json({ message: "Delete" })
})
*/
app.listen(PORT);
console.log(`App listening on port ${PORT}`);
