const MongoClient = require('mongodb').MongoClient
MongoClient.connect('mongodb://localhost:27017')//default port to mongodb
    .then((client) => {
        //name of the database I am using 
        db = client.db('project2022')
        //name of the collection
        coll = db.collection('employees')
    })
    .catch((error) => {
        console.log(error.message)
    })

//find all 
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

//add employee to db
var addEmployeeMongoDB = function (_id, phone, email) {
    return new Promise((resolve, reject) => {
        coll.insertOne({ "_id": _id, "phone": phone, "email": email })
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}
//delete employee to db
var deleteEmployeeMongoDB = function (_id, phone, email) {
    return new Promise((resolve, reject) => {
        coll.deleteOne({ "_id": _id })
            .then((result) => {
                resolve(result)
            })
            .catch((error) => {
                reject(error)
            })
    })
}

//export the function
module.exports = {
    findAll,
    addEmployeeMongoDB,
    deleteEmployeeMongoDB
}
