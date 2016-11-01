var fs = require('fs');
var express = require('express');
var exphbs  = require('express-handlebars');
var strava = require('strava-v3');
var app = express();
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');
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