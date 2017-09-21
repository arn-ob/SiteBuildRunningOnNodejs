var express = require('express');
//var cookie = require('cookie');
var app = express();

app.disable('x-powered-by');

var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "node"
});


var handlebars = require('express-handlebars').create({defaultLayout:'main'});

app.engine('handlebars',handlebars.engine);
app.set('view engine','handlebars');




// step 3.............................

app.use(require('body-parser').urlencoded({
    extended:true
}));

var formidable = require('formidable');
var credentials = require('./auth.js');
app.use(require('cookie-parser')(credentials.cookieSecret));

// this is used for form data get
/////////////////////////

app.set('port',process.env.PORT || 5100);

app.use(express.static(__dirname + '/public'));



app.get('/',function(req, res){
        res.render('home');
});

app.get('/about',function(req, res){
    res.render('about');
});


/// Mibleware code
app.use(function(req, res, next){
    console.log("Looking for url : " + req.url);
    next();
});


// static page not found define

// app.get('/junks', function(req,  res, next){
//     console.log('tried to assess jnk not exist');
//     throw new Error('junk didnt Exit');
// });


// app.use(function(err,req,res,next){
//     console.log('Error : ' + err.message);
//     next();
// });


// form work form name as contact
app.get('/contact',function(req,res){
    res.render('contact',{csrf : 'CSRF token here '});
});




app.post('/process',function(req,res){
    console.log('Form' + req.query.form);
    console.log('CSRF token : ' + req.body._csrf);
    console.log('Email : ' + req.body._csrf);
    console.log('Email : ' + req.body.email);
    console.log('Email : ' + req.body.qus);
    

    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
        //Insert a record in the "customers" table:
        var sql = "INSERT INTO test (name, pass) VALUES ('"+req.body.email+"', '"+ req.body.qus +"')";
        con.query(sql, function (err, result) {
          if (err) throw err;
          console.log("1 record inserted");
        });
      });
    


    res.redirect(303,'/thanks');
});

app.get('/thanks',function(req,res){
    res.render('thanks');
});



// File upload form
app.get('/file-upload', function(req,res){
    var now = new Date();
    res.render('file-upload',{
        year: now.getFullYear(),
        month: now.getMonth() });
});


app.post('/file-upload/:year/:month',
    function(req,res){
        var form = new formidable.IncomingForm();
        form.parse(req,function(err,fields,file){
            if(err){
                return res.redirect(303,'/error');
            }else{
                console.log('Received file');
                
            }
            console.log(file);
            res.redirect(303,'/thanks');
        })
    
});

//.................................................


// work with cookie
app.get('/cookie',function(req,res){
    res.cookie('username','arnob',{expire:new Date() + 9999}).send('username has the value of arnob');
});


app.get('/listcookies',function(req,res){
    console.log('cookies : ',req.cookies);
    res.send('look in the console for cookies');
});

app.get('/deletecookies',function(req,res){
    res.clearCookie('username');
    res.send('username cookie deleted');
});

// ...................

// working with session

var session = require('express-session');
var parseurl = require('parseurl');


app.use(session({
    resave : false,
    saveUninitialized : true,
    secret : credentials.cookieSecret,
}));


// view count

app.use(function(req,res,next){
    var views = req.session.views;

    if(!views){
        views = req.session.views = {};
    }
    var pathname = parseurl(req).pathname;
    views[pathname] = (views[pathname]||0)+1;
    next();
})



app.get('/viewcount',function(req,res,next){
    res.send('you viewsed this page ' + req.session.views['/viewcount']+ 'times');
})



/// File read

var fs = require('fs');

app.get('/readfile',function(req,res,next){
    fs.readFile('./public/readfile/file.txt',function(err,data){
        if(err){
            return console.error(err);
        }
        res.send('the file : '+ data.toString());
    });
});


app.get('/writefile',function(req,res,next){
    fs.writeFile('./public/readfile/file.txt','new data',function(err,data){
        if(err){
            return console.error(err);
        }
        
        fs.readFile('./public/readfile/file.txt',function(err,data){
            if(err){
                return console.error(err);
            }
            res.send('the file : '+ data.toString());
        });
    });
});











// Auto page not found define
app.use(function(req, res){
    console.log('Page not Found 404');
    res.type('text/html');
    res.status(404);
    res.render(404);
});

app.use(function(err,req,res,next){
    console.log('Page not Found 500');
    console.error(err.stack);
    res.status(500);
    res.render(500);
});





app.listen(app.get('port'),function(){
    console.log('Server Running');
});