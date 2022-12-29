var express = require('express')
var app = express()
var bodyParser = require('body-parser')
var mySqlDAO = require('./mySqlDAO')//import the functions
const ejs = require('ejs')
//validator
const { check, validationResult } = require('express-validator');

var express = require('express')
var mongoDAO = require('./mongoDAO')
var app = express()
var mySqlIds = []; //will store MySQL DB ids

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.set('view engine', 'ejs')

//home page
app.get('/', (req, res) => {
    mySqlDAO.getEmployees()
        .then((data) => {
            res.render('home')
            //store the MySQL db ids into an array to check it later
            //when adding a employees into MongoDB
            for (let i = 0; i < data.length; i++) {
                //adding the ids to the array to check later
                mySqlIds[i] = data[i].eid;
            }
            //console.log(mySqlIds);
        })
        .catch((error) => {
            res.send(error)
        })
})

//route /employees
app.get('/employees', (req, res) => {
    mySqlDAO.getEmployees()
        .then((data) => {
            res.render('employees', { 'person': data })
            for (let i = 0; i < data.length; i++) {
                mySqlIds[i] = data[i].eid;
            }
            //console.log(mySqlIds);
        })
        .catch((error) => {
            res.send(error)
        })
})

//route edit employees to get the unique id
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

//send the edit via POST method
app.post('/employees/edit/:eid',
    //run validation checks for name, role and salary
    [   //name must be at least 5 char
        check("ename").isLength({ min: 5 })
            .withMessage("Employee Name must be at least 5 characters")
    ],
    [   //Role can be either Manager or Employee
        check("role").toUpperCase().isIn(["MANAGER", "EMPLOYEE"])
            .withMessage("Role can be either Manager or Employee")
    ],
    [   //Salary must be > 0 and float
        check("salary").isFloat({ min: 0 })
            .withMessage("Salary must be > 0")
    ],
    (req, res) => {
        var id = req.params.eid;
        var name = req.body.ename;
        var role = req.body.role;
        var salary = req.body.salary;
        //store validation errors
        const errors = validationResult(req)
        //if errors returned render editEmployee and for the error messages to be displayed
        if (!errors.isEmpty()) {
            res.render("editEmployee",
                { errors: errors.errors, 'person': { eid: id, ename: name, role: role, salary: salary } })
        } else {
            //no errors from validation update employee
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

//load departments
app.get('/depts', (req, res) => {
    mySqlDAO.getDepts()
        .then((data) => {
            res.render('depts', { 'dept': data })
            //console.log(data)
        })
        .catch((error) => {
            res.send(error)
        })

})

//delete departments
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
                //if dept has employees it can't be deleted
                //will return error 1451. Check it and display msg to the user
                console.log(error);
                if (error.errno == 1451) {
                    res.send(`
                    <h1>Error Message</h1>
                    <br/>
                    <br/>
                    <h1>${depId} has employees and cannot be deleted</h1>
                    <a href="/">Home</a> 
                    <br/>
                    <a href="/depts">Back</a> 
                    `)
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

//load add employee page
app.get('/employeesMongoDB/add', (req, res) => {
    res.render('addMongoDBemployee', { 'errors': undefined })
})

//add employee to the MongoDB DB
//it can only happen if the id already exists on MySQL DB
//if doesn't display a message
app.post('/employeesMongoDB/add/',
    //run validations for fields id, phone and email
    [   //EID must be 4 characters
        check("_id").isLength({ min: 4, max: 4 })
            .withMessage("EID must be 4 characters")
    ],
    [   //Phone must be > 5 characters
        check("phone").isLength({ min: 5 })
            .withMessage("Phone must be > 5 characters")
    ],
    [   //Phone must be numbers
        check("phone").isInt()
            .withMessage("Phone must be numbers")
    ],
    [   //Email must be a valid email address
        check("email").isEmail().toLowerCase()
            .withMessage("Email must be a valid email address")
    ],
    (req, res) => {
        var _id = req.body._id.toUpperCase();
        var phone = req.body.phone;
        var email = req.body.email.toLowerCase();

        //check if the id is on the MySQL DB
        const isFound = mySqlIds.includes(_id);
        console.log(isFound);
        //if not found return a message
        if (!isFound) {
            res.send(`
            <h1>Error Message</h1>
            <br/>
            <br/>
            <h1>Employee ${_id} doesn't exist in MySQL DB</h1>
            <a href="/">Home</a>                    
            `)
            //else keep going
        } else {
            //run the validation checks for id, phone and email
            const errors = validationResult(req)
            //  console.log(errors)
            if (!errors.isEmpty()) {
                //if errors return NOT empty render add page with errors
                res.render("addMongoDBemployee",
                    { errors: errors.errors, 'person': { _id: _id, phone: phone, email: email } })
            } else {
                //no error returned keep goin to the function
                mongoDAO.addEmployeeMongoDB(_id, phone, email)
                    .then(() => {
                        //once employee is added redirect the page to employeesMongoDB
                        res.redirect('/employeesMongoDB')
                    })
                    //if reject is sent from DB display errror message
                    .catch((error) => {
                        if (error.message.includes(_id)) {
                            res.send(`
                        <h1>Error Message</h1>
                        <br/>
                        <br/>
                        <h1>EID ${_id} already exist in MongoDB</h1>
                       
                        <a href="/">Home</a>                    
                        `)
                        } else {
                            res.send(error.message)
                        }
                    })
            }
        }
    })

/* Extra functionality */

//Delete Employees details from both databases
//delete employee from MySql and mongoDB
app.get('/employees/delete/:eid',

    (req, res) => {
        var empId = req.params.eid;
        //console.log(depId)
        //deleteon mySql
        mySqlDAO.deleteEmployee(empId)
            .then(() => {
                //it will happen anyways because its only loaded 
                //whatever exists in the database
            })
            .catch((error) => {
                //no error will come up because whatever is displayed
                //has already pass a catch
            })
        //delete data on mongoDb
        mongoDAO.deleteEmployeeMongoDB(empId)
            .then(() => {
                //send a message to the user
                res.send(`
            <h1>Message</h1>
            <br/>
            <br/>
            <h1>${empId} was deleted from the MySQL and Mongo Databases</h1>
            <a href="/">Home</a> 
            <br/>
            <a href="/employees">Back</a> 
            `)
            })
            .catch((error) => {
                //no error will come up because whatever is displayed
                //has already pass a catch
            })
    })

//load add employee page
app.get('/employees/add', (req, res) => {
    res.render('addMySQL', { 'errors': undefined })
})

//add employee to the MYSQL DB
//check if id already exists in the database
//if does display a message
app.post('/employees/add/',
    //run validations for fields id, phone and email
    [   //EID must be 4 characters
        check("eid").isLength({ min: 4, max: 4 })
            .withMessage("EID must be 4 characters")
    ], //run validation checks for name, role and salary
    [   //name must be at least 5 char
        check("ename").isLength({ min: 5 })
            .withMessage("Employee Name must be at least 5 characters")
    ],
    [   //Role can be either Manager or Employee
        check("role").toUpperCase().isIn(["MANAGER", "EMPLOYEE"])
            .withMessage("Role can be either Manager or Employee")
    ],
    [   //Salary must be > 0 and float
        check("salary").isFloat({ min: 0 })
            .withMessage("Salary must be > 0")
    ],
    [   //Depts can only be
        check("dept").toUpperCase().isIn(["FIN", "HR", "OPS", "R&D", "SAL"])
            .withMessage("Department can be either FIN- Finance, HR - Human Resources, OPS- Operations, R&D- Research & Devel or SAL- Sales")
    ],
    (req, res) => {
        //load into the variables
        var eid = req.body.eid.toUpperCase();
        var ename = req.body.ename.toUpperCase();
        var role = req.body.role.toUpperCase();
        var salary = req.body.salary;
        var dept = req.body.dept.toUpperCase();

        //check if the id is on the MySQL DB
        const isFound = mySqlIds.includes(eid);
        // console.log(isFound);
        //if found return a message as ID already exists
        if (isFound) {
            res.send(`
            <h1>Error Message</h1>
            <br/>
            <br/>
            <h1>Employee ${eid} already exist in MySQL DB</h1>
            <a href="/">Home</a>                    
            `)
            //else keep going
        } else {
            //run the validation checks for id, phone and email
            const errors = validationResult(req)
            //  console.log(errors)
            if (!errors.isEmpty()) {
                //if errors return NOT empty render add page with errors
                res.render("addMySQL",
                    { errors: errors.errors, 'person': { eid: eid, ename: ename, role: role, salary: salary, dept: dept } })
            } else {
                //no error returned keep goin to the function
                mySqlDAO.addEmployee(eid, ename, role, salary, dept)
                    .then(() => {
                        //once employee is added redirect the page to employeesMongoDB
                        res.redirect('/employees')
                    })
                    //if reject is sent from DB display errror message
                    .catch((error) => {
                        if (error.message.includes(eid)) {
                            res.send(`
                        <h1>Error Message</h1>
                        <br/>
                        <br/>
                        <h1>EID ${eid} already exist in MongoDB</h1>                       
                        <a href="/">Home</a>                    
                        `)
                        } else {
                            res.send(error.message)
                        }
                    })
            }
        }
    })

app.listen(3004, () => {
    console.log("Listening on port 3004")
})