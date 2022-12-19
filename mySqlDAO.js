// connection with database
var pmysql = require('promise-mysql')
var pool


pmysql.createPool({
    connectionLimit: 3,
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'proj2022'
})
    .then(p => {
        pool = p
        console.log("database connected")
    })
    .catch(e => {
        console.log("pool error:" + e)
    })


//get all employees
var getEmployees = function () {
    var query1 = 'SELECT * FROM employee'
    //will return a promise
    return new Promise((resolve, reject) => {
        pool.query(query1)
            .then((data) => {
                //console.log(data)
                resolve(data)
            })
            .catch(error => {
                reject(error.sqlMessage)
                if (error.errno == 1146) {
                    res.send("Error - table doesn't exist")
                }
                else {
                    res.send(error.sqlMessage)
                }
            })
    })
}
//get all depts
var getDepts = function () {
    var query4 = 'SELECT * FROM dept'
    //will return a promise
    return new Promise((resolve, reject) => {
        pool.query(query4)
            .then((data) => {
                //console.log(data)
                resolve(data)
            })
            .catch(error => {
                reject(error.sqlMessage)
                if (error.errno == 1146) {
                    res.send("Error - table doesn't exist")
                }
                else {
                    res.send(error.sqlMessage)
                }
            })
    })
}

//get employee per id
var getUniqueEmployee = function (id) {
    var query3 = `SELECT * FROM employee WHERE eid= "${id}"`;
    return new Promise((resolve, reject) => {
        pool.query(query3)
            .then((data) => {
                //console.log(data)
                resolve(data)
            })
            .catch(() => {
                reject(error.sqlMessage)
                if (error.errno == 1146) {
                    res.send("Error - table doesn't exist")
                }
                else {
                    res.send(error.sqlMessage)
                }
            })
    })
}
//update employee per id
var updateEmployee = function (id, name, role, salary) {
    var query2 = `UPDATE employee SET ename="${name}", role="${role}", salary="${salary}" WHERE eid= "${id}" `;
    //console.log(query2)
    return new Promise((resolve, reject) => {
        pool.query(query2)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error.sqlMessage)
                if (error.errno == 1146) {
                    res.send("Error - table doesn't exist")
                }
                else {
                    res.send(error.sqlMessage)
                    //console.log(error.sqlMessage)
                }
            })
    })
}
//delete dept
var deleteDept = function (dept) {
    var delQuery = `DELETE FROM dept WHERE did="${dept}";`
    console.log(delQuery)

    return new Promise((resolve, reject) => {
        pool.query(delQuery)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
//delete employee
var deleteEmployee = function (employee) {
    // var selQuery1 = `SELECT did FROM emp_dept WHERE eid="${employee}";`
    var delQuery1 = `DELETE FROM emp_dept WHERE eid="${employee}";`
    var delQuery2 = `DELETE FROM employee WHERE eid="${employee}";`

    return new Promise((resolve, reject) => {
        pool.query(delQuery1)
            .then((data) => {
                resolve(data)
            })
            .catch()//no catch as all the eid has already been checked
        pool.query(delQuery2)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
//add employee to db
var addEmployee = function (id, name, role, salary, dept) {
    var addQuery1 = `INSERT INTO employee VALUES ("${id}","${name}", "${role}","${salary}");`
    var addQuery2 = `INSERT INTO emp_dept VALUES ("${id}","${dept}");`
    return new Promise((resolve, reject) => {
        pool.query(addQuery1)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error.sqlMessage)
                if (error.errno == 1062) {//ERROR 1062 (23000): Duplicate entry
                    res.send("Error - ID already exists")
                }
                else {
                    res.send(error.sqlMessage)
                    //console.log(error.sqlMessage)
                }
            })
        pool.query(addQuery2)
            .then((data) => {
                resolve(data)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

//export functions
module.exports = {
    getEmployees,
    updateEmployee,
    getUniqueEmployee,
    getDepts,
    deleteDept,
    deleteEmployee,
    addEmployee
}


