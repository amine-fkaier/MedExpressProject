var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require("mongoose");

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var patientsRouter = require('./routes/patient');
var pharmaciesRouter = require('./routes/pharmacy');
var deliveryPersons = require('./routes/deliveryPerson');
const db = require("./models");
const Role = require('./models/role');

require("dotenv").config(); 

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/orders', express.static(path.join(__dirname, 'assets', 'orders')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/patients', patientsRouter)
app.use('/pharmacies', pharmaciesRouter)
app.use('/deliveryPersons', deliveryPersons)
require('./models/index');

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});


mongoose.connect("mongodb://127.0.0.1:27017/healthCareDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log('MongoDB connected');
    initialRoles();
  })
  .catch((err) => console.error('MongoDB connection error:', err));

  async function initialRoles() {
    const count = await Role.estimatedDocumentCount();
    if (count === 0) {
      const adminRole = new Role({name: "admin"});
      const pharmacyRole = new Role({name: "pharmacy"});
      const deliveryPersonRole = new Role({name: "deliveryPerson"});
      const patientRole = new Role({name: "patient"});     

      await adminRole.save();
      await patientRole.save();
      await deliveryPersonRole.save();
      await pharmacyRole.save();
    }
  }



const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});

module.exports = app;
