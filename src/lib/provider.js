/*
    Copyright (c) 2016 eyeOS

    This file is part of Open365.

    Open365 is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as
    published by the Free Software Foundation, either version 3 of the
    License, or (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program. If not, see <http://www.gnu.org/licenses/>.
*/

var redis  = require("redis");
var ttl = 3600*4; //4 hours to get this file
var environment = process.env;
var Uploader = require('./uploader');
var settings = require('./settings');
var pathmodule = require('path');

var log2out = require('log2out');
var logger = log2out.getLogger("Provider");

var Provider = function(client, uploader) {
	this.client = client || redis.createClient(settings.redis_port, settings.redis_host, {no_ready_check: settings.redisNoReadyCheck});
	this.uploader = uploader || new Uploader();
};

Provider.prototype.get = function(id, res) {
	_getById(this.client, "getFile."+id, res, function(err, instance){
		if (err) {
			logger.error('Error getting file with id ' + id);
		}
		var contentType = 'text/plain';
		if (/^\/getFile\/([^\/]+\/print\/)/.test(instance)) {
			instance = instance.replace(/^\/getFile\//, '/getPrintFile/');
			contentType = 'application/pdf';
		}
		res.writeHead(200, {
			'Content-Type': contentType,
			'X-Accel-Redirect': encodeURIComponent(instance)
		});
		res.end('OK');
	});
};

Provider.prototype.getView = function (id, res) {
	_getById(this.client, "getFile." + id, res, function (err, instance) {
		if (err) {
			logger.error('Error getting file for view with id ' + id);
		}

		instance = instance.replace(/^\/getFile\//, '/getViewFile/');

		res.writeHead(200, {
			'X-Accel-Redirect': encodeURIComponent(instance)
		});

		res.end('OK');
	});
};

Provider.prototype.upload = function(req, res) {
	var self = this;
	_getById(this.client, "getFile."+req.params.id, res, function(err, path){
		//we have the file here!
		if(req.files) {
			var overwrite = req.headers.hasOwnProperty("overwrite") && req.headers["overwrite"] === "true";
			self.uploader.saveFile(path, req.files, res, overwrite);
		}
	});
};

Provider.prototype.save = function(id, path, card, type, cb) {
	//the path may be dangerous here, sanitize!
	var user = card.username;
	path = '/'+user+'/'+type+'/'+path;

	var pathComponents = path.split('/');
	for (var i = 0; i < pathComponents.length; i++) {
		if (pathComponents[i] === '..') {
			logger.error('Invalid characters in path: '+path);
			cb('KO');
			return;
		}
	}

	this.client.setex("getFile." + id, ttl, pathmodule.normalize('/getFile' + path), function (err, result) {
        var props = {
            url: '/fetch/' + id
        };
		if (err) {
			logger.error('Error in setex for id ',id);
			cb(err, null);
			return;
		}
		cb(err, JSON.stringify(props));
    });
};

function _getById(client, id, res, cb) {
	client.get(id, function(err, instance){
		if(err || !instance) {
			res.end('KO');
			logger.error('Invalid ID in url: '+ id);
			return;
		}
		cb(err, instance);
	});
}

function __urlParser(card, path, type, cb) {
	//the path may be dangerous here, sanitize!
	var user = card.username;
	path = '/'+user+'/'+type+'/'+path;

	var pathComponents = path.split('/');
	for (var i = 0; i < pathComponents.length; i++) {
		if (pathComponents[i] === '..') {
			logger.error('Invalid characters in path: '+path);
			cb('KO');
			return;
		}
	}
	return path;
}

module.exports = Provider;
