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

var Provider = require('./provider');
var EyeosAuth = require('eyeos-auth');
var settings = require('./settings');
var uuid = require('uuid');
var SharedFileManager = require('./sharedFileManager');
var logger = require('log2out');
var StaticFileHandler = require('./staticFileHandler');

var Controller = function(uuidInj, provider, eyeosAuth, sharedFileManager, staticFileHandler) {
	this.uuid = uuidInj || uuid;
	this.provider = provider || new Provider();
	this.eyeosAuth = eyeosAuth || this._constructAuth();
	this.logger = logger.getLogger('Controller');
	this.staticFileHandler = staticFileHandler || new StaticFileHandler();
	this.sharedFileManager = sharedFileManager || new SharedFileManager(null, this.provider, null);
};

Controller.prototype._constructAuth = function() {
	if(settings.securityStatus === "unsecure") {
		return  {
			verifyRequest: function () {
				return true;
			}
		};
	}
	return new EyeosAuth();
};

Controller.prototype.handleGetFile = function(req, res, next, type) {
	var rn = this.uuid.v4();
	var isValid = this.eyeosAuth.verifyRequest(req);
	if (isValid) {
		var card = JSON.parse(req.header('card'));
		this.provider.save(rn, decodeURIComponent(req.params[0]), card, type, function (err, data) {
			if (err) {
				res.end(err);
				return;
			}
			res.end(data);
		});
	} else {
		res.end('KO');
	}
};

Controller.prototype.handleFetchFile = function(req, res, next) {
	this.provider.get(req.params.id, res);
};

Controller.prototype.handleFetchFileView = function (req, res, next) {
	this.provider.getView(req.params.id, res);
};

Controller.prototype.handleUploadFile = function(req, res, next) {
	if (req.header("base64") === "true") {
		req.files.file.outputFileName = new Buffer(req.files.file.name, "base64").toString("utf-8");
	}
	this.provider.upload(req, res);
};

Controller.prototype.handleSharedFile = function(req, res) {
	var self = this;
	this.sharedFileManager.handleSharedFile(req.params[0],
		function callback (err, data) {
			if (err) {
				self.logger.error('Error on handleSharedFile for ', req.params[0]);
				res.status(404);
				res.end('KO');
				return;
			}
			if(settings.share === 'pojo') {
				res.end(JSON.stringify(data));
			} else {
				res.end(data);
			}
		}
	);
};

Controller.prototype.serveCSS = function (req, res) {
	this.__serveStatic('css', 'text/css', req, res);
};

Controller.prototype.serveIMG = function (req, res) {
	this.__serveStatic('img', 'image/png', req, res);
};

Controller.prototype.__serveStatic = function (folder, contentType, req, res) {
	var self = this;
	this.staticFileHandler.getFile('../' + folder + '/' + req.params.name, function (err, data) {
		if (err) {
			self.logger.error('Error retrieving ' + folder + '. Err:', err);
			res.status(404);
			res.end('KO');
			return;
		}
		res.header('Content-Type', contentType);
		res.end(data);
	});
};

module.exports = Controller;
