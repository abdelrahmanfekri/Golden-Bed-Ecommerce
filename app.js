var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mongoose = require('mongoose');
var session =require('express-session');
var MongoDBStore = require('connect-mongodb-session')(session);
var url = "mongodb+srv://golden-bed:Aa26951546@cluster0.iverxbm.mongodb.net/?retryWrites=true&w=majority";;
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var app = express();

const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://<username>:<password>@cluster0.iverxbm.mongodb.net/?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("mydb").collection("devices");
  // perform actions on the collection object
  console.log("database connected");
  client.close();
});

var store = new MongoDBStore({
  uri: url,
  databaseName:"mydb",
  collection: 'mySessions'
});

store.on('error', function(error) {
  console.log(error);
});



app.use(session({
  secret:"key secret for the session",
  resave:false,
  saveUninitialized:false,
  store:store,
})
);
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);

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

module.exports = app;
