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

var query1 = 'SELECT * FROM employee'

var getEmployees = function () {
    //will return a promise
    return new Promise((resolve, reject) => {

        pool.query(query1)
            .then((data) => {
                console.log(data)
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

var query4 = 'SELECT * FROM dept'

var getDepts = function () {
    //will return a promise
    return new Promise((resolve, reject) => {

        pool.query(query4)
            .then((data) => {
                console.log(data)
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


var getUniqueEmployee = function (id) {
    var query3 = `SELECT * FROM employee WHERE eid= "${id}"`;
    return new Promise((resolve, reject) => {
        pool.query(query3)
            .then((data) => {
                console.log(data)
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


var updateEmployee = function (id, name, role, salary) {
    var query2 = `UPDATE employee SET ename="${name}", role="${role}", salary="${salary}" WHERE eid= "${id}" `;
    console.log(query2)
    return new Promise((resolve, reject) => {
        pool.query(query2)
            .then((data) => {
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

var deleteDept = function(dept){
    var delQuery = `DELETE FROM dept WHERE did="${dept}";`
    console.log(delQuery)
    
    return new Promise((resolve, reject)=>{
        pool.query(delQuery)
        .then((data) => {
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

//export the function
module.exports = {
    getEmployees,
    updateEmployee,
    getUniqueEmployee,
    getDepts,
    deleteDept
}


