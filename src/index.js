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

//While inserting create an account for each employee with username as email and randome generated password and send those credentials via email to employee
app.post('/', uploads.single('csv'), async (req, res) => {
    try {
        var jsonObj = await csv().fromFile(req.file.path);

        var empArr = jsonObj.map((emp) => {
            emp.password = generator.generate({
                length: 10,
                numbers: true
            });
            return emp;
        })
        console.log(empArr);
        await User.insertMany(empArr);
        res.status(201).send('Inserted successfully');
    } catch (e) {
        console.log(e);
        res.status(500).send('Internal server error');
    }
});

//Inserting a single user
app.post('/user', async (req, res) => {
    try {
        var user = new User(req.body);
        await user.save();
        res.status(201).send('Inserted successfully');
    } catch (e) {
        res.status(500).send('Internal server errror');
    }
})

//List All Inserted Details 
app.get('/', auth, async (req, res) => {
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