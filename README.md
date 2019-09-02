
# Mailer :

1. Configure mail values in config/global.js

	- update smtp values in 'mailOptions' object

2. This is a complete example to send an e-mail with plaintext and HTML body

	var Mailer = rootRequire('support/mailer');

 	Mailer.mail({
		to 		: 'xcode@agileinfoways.com',
		from 	: 'xcode',
		subject : 'xCode Team - Information',
		html	: 'Testing'
	}, function(error, info){
		if(error){
			return console.log(error);
		}
		console.log('Message sent: ' + info.response);
	});


# Push Notification :

1. Configure notification values in config/global.js

  - update smtp values in 'FCM' object for FCM and put 'pem' file into 'support/push-notifications/pemFiles' directory for APN

2. How to send APN/FCM notification

	var PN = rootRequire('support/push-notifications/pn');

	var params = {
		to : 'dsde34e34e',
		data  : { message : 'xCode' }
	};

	// send iOS notification if iOS device type
	PN.apn(params, function(error, result){
		if(error){
			return console.log(error);
		}
		console.log('Sent: ', result);
	});

	// OR

	// send Android notification if Android device type
	PN.fcm(params, function(error, result){
		if(error){
			return console.log(error);
		}
		console.log('Sent: ', result);
	});


#  Socket.io :

1. How to use socket instance to create apis

	var SocketIO = rootRequire('support/socket.io');

	SocketIO.on('io', function(io){ // instance of socket connect

		var nsp = io.of('/xcode'); 	// create a namespace

		nsp.on('connection', function(socket){
			console.log('user namespace connection established!!!');

			socket.emit('welcome', 'You are welcome');
			socket.on('message', function(message){
				socket.emit('message', message);
			});
		});

		// OR

		// direct usage without creating namespace
		// io.on('connection', function(socket) {
		//	 console.log('connection established!!!');
		// });
	});


# Uploader :

 - use method in api controller function and get files & fields data from http request

1. How to use formdata in api

	apiControllerHandler : function(req, res){
		Uploader.getFormFields(req, function(err, fields, files){
			if(err){
				return res.send({success: 0, message: 'Oops! something went wrong.'});
			}

			console.log(fields, files);
		});
	}


# Run script on boot time
- which forever - a command to find a path for forever
- sudo pico /etc/rc.local
- /usr/bin/sudo -u agile -H /usr/local/bin/forever start /opt/Nodeserver/x-code/forever.json | while IFS= read -r line; do echo "$(date) $line"; done >> /opt/Nodeserver/x-code/logs/startup.log 2>&1

  # Note:
   - node lib should be in /usr/bin/node
   - otherwise use command below
       - sudo ln -s "$(which node)" /usr/bin/node


# Useful URLS of our Framework
- http://localhost:3000/socket (Socket APIs Testing - only json parameters excepted)
- http://localhost:3000/v1/encode  (to encode json - only json parameters excepted)
- http://localhost:3000/v1/decode (to decode string - encoded string value excepted)


# API USAGE :

1. Login API :

@headers :- null
@params :-
{
	"email" : "admin@agile.com",
	"password": "123456"
}
@response :-
{
    "status": 1,
    "message": "Login successfully",
    "data": {
        "email": "admin@agile.com",
        "password": "123456",
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsImVtYWlsIjoiYWRtaW5AYWdpbGUuY29tIiwiaWF0IjoxNDk4MjAxMzkxLCJleHAiOjE0OTgyODc3OTF9.oEIyrBswpNcWV4KsZ986Ok5lQF_P0TRAM726MfUYw1g"
    }
}

# ENCODED :
@headers :- null
@params[ENCODED] :-
{
	"encoded":"cJ19m46hnWaX6uS+oX1YagR++jfIDH7CXUDxjJ/v05DkSLQL9ajoRbl15SdknmmJ"
}
@response[ENCODED] :-
{
    "status": 1,
    "message": "Login successfully",
    "data": "cJ19m46hnWaX6uS+oX1YagR++jfIDH7CXUDxjJ/v05C9ZVStxMb4jZuUzwdfG52o3gayH5IWGaLPw7aAA2eDCotuDwlCDHWEz12NNyKbr8Pg9vsC0MEfV393nbJKL1f/Ax833H4tzHUV4EgwbUucfKF+Vtbk3E/eaOXAtONbBE8tmJEG2XDDvXsBdqPzMMpAZ3RsWZs9iZ3cIpJwKqkW3yrCTH3NitI1gYexf6O+OE5gy+CD/SSBLkmhvjVME22edPu2tqdnf+YZvoO7wLRIUAIk3pa+r+MAxLOGtjezoPTvWJtZCTqhbK5di2Vg6BMi"
}


2. Test API :
@headers :-
 - authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsImVtYWlsIjoiYWRtaW5AYWdpbGUuY29tIiwiaWF0IjoxNDk4MjAwNjIwLCJleHAiOjE0OTgyODcwMjB9.FbIEyI1Y8tjPbQwk-DtVza2zqJ0jeOnKfMZU8XJDvrc
@params :- null
@response :-
{
    "status": 1,
    "message": "TEST MESSAGE",
    "data": {
        "message": "test"
    }
}

# ENCODED :
@headers :-
 - authorization: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOjEsImVtYWlsIjoiYWRtaW5AYWdpbGUuY29tIiwiaWF0IjoxNDk4MjAwNjIwLCJleHAiOjE0OTgyODcwMjB9.FbIEyI1Y8tjPbQwk-DtVza2zqJ0jeOnKfMZU8XJDvrc
@params[ENCODED] :-
 - encoded: uh9KfKhJBpMcba%2BvVyS%2B%2BQ%3D%3D
@response[ENCODED] :-
{
    "status": 1,
    "message": "TEST MESSAGE",
    "data": "npvvE57GDL4lNAPsQ0moJG9MepRtoDzugzFPbOatByw="
}