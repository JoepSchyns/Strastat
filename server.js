var fs = require('fs');
var express = require('express');
var exphbs  = require('express-handlebars');
var strava = require('strava-v3');
var Promise = require('promise');
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
var code;
app.get('/oauth',function(req,res){ //switch to https://github.com/barc/express-hbs
	code = req.param('code');

	if(req.param('error') == undefined){ //if no errors in oauth
		strava.oauth.getToken(code,function(err,result){

			res.render('oauthresult',{athlete:result.athlete,helpers : {
				activities : function(){
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
							console.log(values[0].name);
							return "succes";
						}).catch(function(reason){
							console.log('error in getting activities');
							console.log(reason)
						});					
					});
				}
			}});
		});
		
	}else
		res.render('error',{error:req.params.error});

});
https.listen(3070);
console.log("Server started");