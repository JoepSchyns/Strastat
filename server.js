var fs = require('fs');
var express = require('express');
var nunjucks = require('nunjucks')
var strava = require('strava-v3');
var Promise = require('promise');
var app = express();
nunjucks.configure('views', {
    autoescape: true,
    express: app
});
var https = require('https').createServer({
  key: fs.readFileSync('/etc/letsencrypt/live/joepschyns.me/privkey.pem'),
  cert: fs.readFileSync('/etc/letsencrypt/live/joepschyns.me/cert.pem')
}, app);
app.use(express.static(__dirname + '/public'));

app.get('/', function (req, res) {
   var s = strava.oauth.getRequestAccessURL({scope:"view_private"});
  res.render(__dirname + '/views/index.html',{url:decodeURIComponent(s)});
});
var code;
app.get('/oauth',function(req,res){
	code = req.param('code');

	if(req.param('error') == undefined){ //if no errors in oauth
		strava.oauth.getToken(code,function(err,result){
			var athlete = result.athlete;
			strava.athlete.listActivities({},function(err,result){
				var activityPromises = [];
				for (var i = 0; i < result.length; i++) {
					var promise = new Promise (function(resolve,reject){
						strava.activities.get({id:result[i].id},function(err,result){
						activityPromises.push(result);
						if(!err) //no errors
							resolve(result);
						else
							reject(err);
						});
					});
					activityPromises.push(promise);
				}
				Promise.all(activityPromises).then(function(values) {
					console.log('succes getting activities');
					res.render(__dirname + '/views/oauthresult.html',{athlete:athlete,activities:values});
				}).catch(function(reason){
					console.log('error in getting activities');
					console.log(reason)
				});					
			});
				
			//res.render(__dirname + '/views/oauthresult.html',{athlete:result.athlete});
		});
		
	}else
		res.render('error',{error:req.params.error});

});
https.listen(3070);
console.log("Server started");