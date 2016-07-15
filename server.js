'use strict';
var fs = require("fs");
const Hapi = require('hapi');
var crypto = require('crypto');
var device = require('device');
var deviceTypeArray = new Array('desktop','tv','tablet','phone','bot','car','default');
var exists = fs.existsSync("database");

if(!exists) {
    console.log("Creating DB file.");
    fs.openSync("database", "w");
}

var sqlite3 = require("sqlite3").verbose();
var db = new sqlite3.Database("database");


db.serialize(function() {
	db.run("CREATE TABLE if not exists url (shorturl TEXT, fullurl TEXT, device TEXT,creation_time INTEGER, primary key(shorturl,device))");
	
    });



const server = new Hapi.Server();
server.connection({ port: 8080 });

server.route({
	method: 'GET',
	    path: '/admin',
	    handler: function (request, reply) {
	    var allurls = new Array();
	    db.all("SELECT * FROM url", function (err, rows) {
		    
		    reply(rows);
		});
	}
    });

server.route({
        method: 'POST',
            path: '/admin',
            handler: function (request, reply) {
	    //TODO: Validate url
	    var shorturl = crypto.randomBytes(6).toString('base64').replace(/\+/g, '0').replace(/\//g, '0');
	    db.run("INSERT INTO url VALUES (\""+shorturl+"\",\""+request.payload.fullurl+"\",\"default\","+Math.round(new Date().getTime() / 1000)
+")");
	    reply(shorturl);
        }
    });

server.route({
        method: 'GET',
            path: '/admin/{shorturl}',
            handler: function (request, reply) {
         
            db.all("SELECT * FROM url WHERE shorturl=\""+request.params.shorturl+"\"", function (err, rows) {
                    
                    reply(rows);
                });
        }
    });

server.route({
	method: ['PUT','POST'],
            path: '/admin/{shorturl}',
            handler: function (request, reply) {
	    deviceTypeArray.forEach(function(deviceType) {
		    if (request.payload[deviceType] != undefined) {
			db.run("INSERT OR REPLACE INTO url VALUES (\""+request.params.shorturl+"\",\""+request.payload[deviceType]+"\",\""+deviceType+"\","+Math.round(new Date().getTime() / 1000)+")");
		    }
		})
		reply(request.params.shorturl);
        }
    });

server.route({
	method: 'GET',
	    path: '/{shorturl}',
	    handler: function (request, reply) {
	    var userDeviceType = device(request.headers['user-agent']).type;
	    var defaulturl,redirecturl;
	    db.all("SELECT * FROM url WHERE shorturl=\""+request.params.shorturl+"\"", function(err,rows) {
		    //TOOD: Check against user agent matches
		    rows.forEach(function(row) {
			    if (row.device == userDeviceType) {
				if (row.fullurl != "") {
				    redirecturl = row.fullurl;
				} else if (row.device == "default") {
				    defaulturl = row.fullurl;
				}
			    }})
			if (redirecturl) {
			    reply.redirect(redirecturl);
			} else {
			    reply.redirect(defaulturl);
			}
		});
	}
    });

server.start((err) => {

	if (err) {
	    throw err;
	}
	console.log('Server running at:', server.info.uri);
    });