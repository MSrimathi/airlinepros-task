require('dotenv').config();
require('./db/mongoose');
const generator = require('generate-password');
var express = require('express');
const path = require('path');
var multer = require('multer');
var csv = require('csvtojson');
var bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const auth = require('./middleware/auth');
const checkRole = require('./middleware/role');
const User = require('./model/user');
const nodemailer = require('nodemailer');

var app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static(path.resolve(__dirname, 'public')));

var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './public/uploads');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});

var uploads = multer({ storage: storage });

var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'airlinepros_admin@gmail.com',
        pass: 'airlinepros'
    }
})

//While inserting create an account for each employee with username as email and randome generated password and send those credentials via email to employee
app.post('/api/users', uploads.single('csv'), async (req, res) => {
    try {
        var jsonObj = await csv().fromFile(req.file.path);

        var empArr = jsonObj.map((emp) => {
            var password = generator.generate({
                length: 10,
                numbers: true
            });

            var username = emp['Email'];
            var date_of_join = emp['Date of join'];
            return {
                username,
                password,
                date_of_join
            };
        })
        console.log(empArr);
        var users = await User.insertMany(empArr);

        await Promise.all(users.map(async (user) => {
            var mailOptions = {
                from: 'airlinepros_admin@gmail.com',
                to: user.username,
                subject: 'Please find your password for the site',
                text: user.password
            }
            console.log(mailOptions);
            transporter.sendMail(mailOptions, function (error, info) {
                console.log('Error', error);
                console.log('Info', info);
            })
        }))
        res.status(201).send('Inserted successfully');
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal server error');
    }
});

//Inserting a single user
app.post('/api/user', async (req, res) => {
    try {
        var user = new User(req.body);
        await user.save();
        res.status(201).send('Inserted successfully');
    } catch (e) {
        res.status(500).send('Internal server errror');
    }
})

//List All Inserted Details 
app.get('/api/users', auth, async (req, res) => {
    try {
        var users = await User.find();
        res.status(200).send({
            msg: 'User records',
            userDetails: users
        })
    } catch (e) {
        res.status(500).send('Internal server errror');
    }
})

//api for login
app.post('/api/login', async function (req, res) {
    try {
        var user = await User.findOne({
            username: req.body.username
        })

        if (!user) {
            res.status(404).send('Unable to login');
            return;
        }

        var token = await jwt.sign({ _id: user._id }, process.env.SECRET_KEY, { expiresIn: '2w' });

        res.status(200).send({
            msg: 'Login Successfully',
            user,
            token
        });
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal Server Error');
    }
});

//api for getting the detail page of the record
app.get('/api/user/:id',auth, async (req,res) => {
    try{
        var user = await User.findById(req.params.id);
        res.status(200).send({
            msg:'Details of particular user',
            userDetails: user
        });
    }catch(e){
        res.status(500).send("internal Server Error");
    }
})

//api for update
app.put('/api/user/:id', auth, checkRole('SUPER_USER'), async function (req, res) {
    try {
        await User.findByIdAndUpdate(req.params.id, req.body);
        res.status(201).send('Employee updated successfully');
    } catch (e) {
        res.status(500).send("internal Server Error");
    }
})

//api for delete
app.delete('/api/user/:id', auth, checkRole('SUPER_USER'), async function (req, res) {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).send('Employee details Deleted successfully');
    } catch (e) {
        res.status(500).send('internal Server Error');
    }
})

app.listen(4000, function () {
    console.log("This server is up on port 4000");
});