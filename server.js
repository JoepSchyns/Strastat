var fs = require('fs');
var express = require('express');
var hbs  = require('express-hbs');
var strava = require('strava-v3');
var app = express();
// Use `.hbs` for extensions and find partials in `views/partials`.
app.engine('hbs', hbs.express4({
  partialsDir: __dirname + '/views/partials',
   defaultLayout: __dirname + '/views/main'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

var https = require('https').createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/joepschyns.me/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/joepschyns.me/cert.pem')
}, app);
app.use(express.static(__dirname + '/public'));




app.get('/', function (req, res) {
   var s = strava.oauth.getRequestAccessURL({scope:"view_private"});
   res.render('login',{url:decodeURIComponent(s)});
});

app.get('/oauth',function(req,res){ //switch to https://github.com/barc/express-hbs
	console.log(req.param('code'));
	console.log(req.param('error'));
	if(req.param('error') == undefined){ //if no errors in oauth
		strava.oauth.getToken(req.param('code'),function(err,result){
			console.log(result);
			res.render('oauthresult',{athlete:result.athlete});
		});
		
	}else
		res.render('error',{error:req.params.error});

});
https.listen(3070);
console.log("Server started");