var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mySqlDAO = require('./mySqlDAO')//import the functions
const ejs = require('ejs')
const { check, validationResult } = require('express-validator');

var express = require('express')
var mongoDAO = require('./mongoDAO')
var app = express()


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')


app.get('/', (req, res) => {
    res.render('home')
})

app.get('/employees', (req, res) => {
    mySqlDAO.getEmployees()
        .then((data) => {

            res.render('employees', { 'person': data })
        })
        .catch((error) => {
            res.send(error)
        })

})

app.get('/employees/edit/:eid', (req, res) => {
    var id = req.params.eid;

    mySqlDAO.getUniqueEmployee(id)
        .then((data) => {
            //console.log(data)
            //check if data.lenght > 0
            if (data.length > 0) {
                res.render('editEmployee', { 'person': data[0], 'errors': undefined })
            }

        })
        .catch((error) => {
            res.send(error)
        })

})

app.post('/employees/edit/:eid',
    [
        check("ename").isLength({ min: 5 })
            .withMessage("Name must be > 5")
    ],
    [
        check("role").toUpperCase().isIn(["MANAGER", "EMPLOYEE"])
            .withMessage("Role should be Manager or Employee")
    ],
    [
        check("salary").isInt({ min: 0 })
            .withMessage("Salary should be > 0")
    ],

    (req, res) => {
        var id = req.params.eid;
        var name = req.body.ename;
        var role = req.body.role;
        var salary = req.body.salary;

        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            res.render("editEmployee",
                { errors: errors.errors, 'person': { eid: id, ename: name, role: role, salary: salary } })
        } else {
            mySqlDAO.updateEmployee(id, name, role, salary)
                .then(() => {
                    //console.log("yessssss")
                    res.redirect('/employees')


                })
                .catch((error) => {
                    res.send(error)
                })
        }


    })


app.get('/depts', (req, res) => {


    mySqlDAO.getDepts()
        .then((data) => {

            res.render('depts', { 'dept': data })
            console.log(data)

        })
        .catch((error) => {
            res.send(error)

        })

})

app.get('/depts/delete/:did',

    (req, res) => {
        var depId = req.params.did;
        //console.log(depId)
        mySqlDAO.deleteDept(depId)
            .then(() => {
                //console.log("yessssss")
                res.redirect('/depts')
            })
            .catch((error) => {
                console.log(error);
                if (error.errno == 1451) {
                    res.send(`
                    <h1>Error Message</h1>
                    <br/>
                    <br/>
                    <h1>${depId} has employees and cannot be deleted</h1>`)
                }
            })
    })




// router to employees mongoDB
app.get('/employeesMongoDB', (req, res) => {

    mongoDAO.findAll()
        .then((data) => {
            //res.send(data)
            res.render('employeesMongoDB', { 'person': data })
        })
        .catch((error) => {
            res.send(error)
        })

})

app.get('/employeesMongoDB/add', (req, res) => {

    res.render('addMongoDBemployee')

})

app.post('/employeesMongoDB', (req, res) => {
    var eid = req.params.eid;
    var phone = req.body.ename;
    var email = req.body.role;


    mongoDAO.addEmployeeMongoDB({
        _id: eid,
        phone: phone,
        email: email
    })
        .then((data) => {
            // Do Something
            res.render('addMongoDBemployee')

        })
        .catch((error) => {
            if (error.message.includes("E11000")) {
                res.send("Error _id:6 already exists")
            } else {
                res.send(error.message)
            }
        })
})




app.listen(3004, () => {
    console.log("Listening on port 3004")
})