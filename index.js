var express = require('express')
var app = express()

const ejs = require('ejs')
app.set('view engine', 'ejs')
var mySqlDAO = require('./mySqlDAO')//import the functions



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

            res.render('editEmployee', { 'person': data[0] })
        })
        .catch((error) => {
            res.send(error)
        })

})

app.post('/employees/edit/:eid', (req, res) => {
    var id = req.params.eid;
    var name = req.body.name;
  

    console.log(name)
    mySqlDAO.updateEmployee(id, name)
        .then(() => {
            //console.log("yessssss")
            res.redirect('/employees')


        })
        .catch((error) => {
            res.send(error)
        })

})


app.get('/depts', (req, res) => {
    mySqlDAO.getDepts()
        .then((data) => {

            res.render('depts', { 'dept': data })
        })
        .catch((error) => {
            res.send(error)
        })

})




app.listen(3004, () => {
    console.log("Listening on port 3004")
})