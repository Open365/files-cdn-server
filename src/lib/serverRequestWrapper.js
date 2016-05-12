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

var log2out = require('log2out');
var Controller = require('./controller');
var restify = require('restify');
var settings = require('./settings');

var ServerRequestWrapper = function (restifyInj, controller, settingsInj) {
	this.restify = restifyInj || restify.createServer();
	this.controller = controller || new Controller();
    this.settings = settingsInj || settings;
	this.logger = log2out.getLogger('ServerRequestWrapper');
};

ServerRequestWrapper.prototype.getUserFiles = function (req, res, next) {
	var self = this;
	this.restify.get(/^\/userfiles\/(.*)/, function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleGetFile(req, res, next, 'files');
	});
};

ServerRequestWrapper.prototype.getGroupFiles = function (req, res, next) {
	var self = this;
	this.restify.get(/^\/groupfiles\/(.*)/, function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleGetFile(req, res, next, 'workgroups');
	});
};

ServerRequestWrapper.prototype.getPrintFiles = function (req, res, next) {
	var self = this;
	this.restify.get(/^\/printfiles\/(.*)/, function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleGetFile(req, res, next, 'print');
	});
};

ServerRequestWrapper.prototype.getLocalFiles = function (req, res, next) {
	var self = this;
	this.restify.get(/^\/localfiles\/(.*)/, function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleGetFile(req, res, next, 'local');
	});
};

ServerRequestWrapper.prototype.getSharedFile = function (req, res, next) {
	var self = this;
	this.restify.get(/^\/sharedfile\/(.*)/, function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleSharedFile(req, res, next);
	});
};

ServerRequestWrapper.prototype.getCSS = function (req, res, next) {
	var self = this;
	this.restify.get('/sharedfile/css/:name', function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.serveCSS(req, res, next);
	});
};

ServerRequestWrapper.prototype.getIMG = function (req, res, next) {
	var self = this;
	this.restify.get('/sharedfile/img/:name', function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.serveIMG(req, res, next);
	});
};

ServerRequestWrapper.prototype.getNetwork = function (req, res, next) {
	var self = this;
	this.restify.get(/^\/network\/(.*)/, function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleGetFile(req, res, next, 'networkdrives');
	});
};

ServerRequestWrapper.prototype.getFetch = function (req, res, next) {
	var self = this;
	this.restify.get('/fetch/:id', function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleFetchFile(req, res, next);
	});
};

ServerRequestWrapper.prototype.getFetchView = function (req, res, next) {
	var self = this;
	this.restify.get('/fetch/:id/view', function (req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleFetchFileView(req, res, next);
	});
};

ServerRequestWrapper.prototype.headFetch = function (req, res, next) {
	var self = this;
	this.restify.head('/fetch/:id', function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleFetchFile(req, res, next);
	});
};

ServerRequestWrapper.prototype.postFetch = function (req, res, next) {
	var self = this;
	this.restify.post('/fetch/:id', function(req, res, next) {
		self.logger.debug("%s %s", req.method, req.url);
		self.controller.handleUploadFile(req, res, next);
	});
};

ServerRequestWrapper.prototype.startRestify = function () {
	var self = this;
    this.restify.use(restify.multipartBodyParser());
    this.restify.use(restify.queryParser());
    this.restify.listen(this.settings.filesCdnPort, function () {
		self.logger.info('%s listening at %s', self.restify.name, self.restify.url);
	});
};

ServerRequestWrapper.prototype.addListeners = function () {
	var self = this;
	this.restify.on('uncaughtException', function (req, res, route, err) {
		self.logger.error("Error in route: %j: %j", route, err.stack);
		res.send(err);
	});
};


module.exports = ServerRequestWrapper;
