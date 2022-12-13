const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://localhost:27017')//default port to mongodb
    .then((client) => {
        db = client.db('project2022')
        coll = db.collection('employees')
    })
    .catch((error) => {
        console.log(error.message)
    })


var findAll = function () {
    return new Promise((resolve, reject) => {
        var cursor = coll.find()
        cursor.toArray()
            .then((documents) => {
                resolve(documents)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

var addEmployeeMongoDB = function (employee) {
    return new Promise((resolve, reject) => {
        coll.insertOne(employee)
            .then((documents) => {
                resolve(documents)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

//export the function
module.exports = {
    findAll,
    addEmployeeMongoDB
}
