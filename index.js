var express = require('express'); // express ¶óÀÌºê·¯¸® import
var mysql = require('mysql'); // Mysql Å¬¶óÀÌ¾ðÆ® ¶óÀÌºê·¯¸® import
var xmlparser = require('express-xml-bodyparser') // xml ÆÄ½Ì ¶óÀÌºê·¯¸® import

// connection °´Ã¼ »ý¼º
var connection = mysql.createConnection({
	host:'localhost',
	port: 3306,
	user: 'root',
	password: 'qaz1234q',
	database: 'deepingsauce_service_test'
});

var app = express();

// ThingPlug ¼­¹ö·Î ºÎÅÍ ¹ÞÀº xml µ¥ÀÌÅÍ¸¦ ÆÄ½ÌÇÏ±â À§ÇØ Ãß°¡
app.use(xmlparser());

// [<ip ÁÖ¼Ò>:3000/mycallback]·Î POST ¿äÃ»ÀÌ µé¾î¿ÔÀ» ¶§
app.post('/mycallback',function(request, response) {
	//var notificationMessage = request.body['m2m:cin']; // Subscription Data
	//var content = notificationMessage.con[0]; // Subscription ÀÇ Content
	//var time = notificationMessage.lt[0]; // Subscription ÀÇ ¹ß»ý½Ã°¢
	//console.log(content,time);
	var notificationMessage = request.body['dps_din']
	var dev_id = notificationMessage.dev_id[0];
	var img = notificationMessage.img[0];
	
	var imageDecoded = Buffer.from(img,'base64');
	require("fs").writeFile("out.png",img,'base64',function(err){
		console.log("ErrorMessage:")
		console.log(err);
	});
	
	console.log("receive suceed\n")
	console.log("received content : \n")
	console.log(dev_id)
/*
	// notificationMessage ÀÇ con,lt µ¥ÀÌÅÍ¸¦ Mysql ÀÇ subscription_data Å×ÀÌºí¿¡ »ðÀÔÇÏ´Â Äõ¸® ½ÇÇà
	connection.query('INSERT INTO subscription_data SET ?',
	{ con: content, lt: time }, function (err, result) {
		if (err) {
			console.error(err);
		}
		response.sendStatus(200); // µ¥ÀÌÅÍ ¼ö½Å¿¡ ¼º°øÇßÀ½À» ThingPlug ¼­¹ö¿¡ ÀÀ´ä
	});*/
});

// [<ip ÁÖ¼Ò>:3000/subscription_data]·Î GET ¿äÃ»ÀÌ µé¾î¿ÔÀ» ¶§
app.get('/subscription_data', function(request, response) {

	// Mysql ÀÇ subscription_data Å×ÀÌºí¿¡¼­ ¸ðµç µ¥ÀÌÅÍ¸¦ Á¶È¸ÇÏ´Â Äõ¸® ½ÇÇà
	connection.query('SELECT * FROM subscription_data', function(err, result) {
		if (err) {
			console.error(err);
		}
		response.json(result);
	});
});

// [<ip ÁÖ¼Ò>:3000/dashboard]·Î GET ¿äÃ»ÀÌ µé¾î¿ÔÀ» ¶§
app.get('/dashboard', function(request, response) {

	// Mysql ÀÇ subscription_data Å×ÀÌºí¿¡¼­ ¸ðµç µ¥ÀÌÅÍ¸¦ Á¶È¸ÇÏ´Â Äõ¸® ½ÇÇà
	connection.query('SELECT * FROM subscription_data', function(err, result) {
		if (err) {
			console.error(err);
		}
		var htmlTableData = ''
		
		// Mysql ¿¡¼­ °¡Á®¿Â subscription data ¸¦ html table row ·Î º¯È¯
		result.forEach(function(el) {
			htmlTableData = htmlTableData + `
			<tr>
				<td>${el.lt}</td>
				<td>${el.con}</td>
			</tr>`
		}, this);
		
		var html = `
		<!DOCTYPE html>
		<html>
			<head>
				<meta charset ="utf-8">
				<title>Dashboard</title>
			</head>
			<body>
				<h1>Dashboard</h1>
				<table>
					<tr>
						<th>time</th>
						<th>content</th>
					</tr>
					${htmlTableData}
				</table>
			</body>
		</html>
		`;
		response.send(html); // ºê¶ó¿ìÀú¿¡ Ãâ·ÂÇÏ±â À§ÇÑ html À» ÀÀ´ä
	});
});

// [<ip ÁÖ¼Ò>:3000/]·Î GT ¿äÃ»ÀÌ µé¾î¿ÔÀ» ¶§
app.get('/', function (request, response) {
	response.send('Hello World!');
});

// ¼­¹ö¸¦ 3000 ¹ø Æ÷Æ®·Î ¿ÀÇÂÇÏ°í ¿äÃ»À» ´ë±â
app.listen(3000, function() {
	console.log('deeping sauce app listening on port 3000!');
});
