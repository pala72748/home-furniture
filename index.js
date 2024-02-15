var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var bodyParser = require('body-parser');
var cors = require('cors');
var indexRouter = require('./routes/index');
var ProductCategoryRoute = require('./routes/productcategory')
var ProductRoute = require('./routes/product')
var BlogRoute = require('./routes/blog')
var adminroute = require('./models/adminlogin');
var blogroute = require('./routes/blogcategory')
var app = express();

app.use(bodyParser.json())
app.use(cors());

//All static route

app.use('/product-cat',express.static('image/category'))
app.use('/blog-cat',express.static('image/blog-category'))
app.use('/product',express.static('image/product'))
app.use('/blog',express.static('image/blog'))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, '../frontend/dist')));

app.use('/', indexRouter);
app.use('/admin',adminroute);
app.use("/product-category",ProductCategoryRoute)
app.use("/blog-category",blogroute)
app.use('/product',ProductRoute)
app.use('/blog',BlogRoute)

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

const PORT = 3000;
 
app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})

module.exports = app;
