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

var ServerRequestWrapper = require('./serverRequestWrapper'),
	mongoose = require('mongoose'),
	settings = require('./settings'),
	logger = require('log2out');

var Server = function(serverRequestWrapper, customMongoose, customSettings) {
	this.mongoose = customMongoose || mongoose;
	this.logger = logger.getLogger('Server');
	this.settings = customSettings || settings;
	this.serverRequestWrapper = serverRequestWrapper || new ServerRequestWrapper();
};

Server.prototype.start = function() {
    this.serverRequestWrapper.startRestify();
    this.serverRequestWrapper.addListeners();

    // Adding restify routes
    this.serverRequestWrapper.getUserFiles();
    this.serverRequestWrapper.getGroupFiles();
    this.serverRequestWrapper.getPrintFiles();
    this.serverRequestWrapper.getLocalFiles();
	this.serverRequestWrapper.getCSS();
	this.serverRequestWrapper.getIMG();
	this.serverRequestWrapper.getSharedFile();
	this.serverRequestWrapper.getNetwork();
	this.serverRequestWrapper.getFetch();
	this.serverRequestWrapper.getFetchView();
	this.serverRequestWrapper.headFetch();
	this.serverRequestWrapper.postFetch();

	this.connect();
};

Server.prototype.getConnection = function () {
    return this.mongoose.connection;
};


Server.prototype.connect = function () {
	var self = this;

	var url = 'mongodb://'
     + this.settings.mongo.host + ':'
     + this.settings.mongo.port + '/'
     + this.settings.mongo.db;

	this.__mongooseConnect(url);
	this.mongoose.connection.on('connected', function () {
		self.logger.debug('\n***************\nConnected to mongo\n***************');
	});

	this.mongoose.connection.on('disconnected', function () {
		self.logger.warn('Disconnected from mongo');
		setTimeout(function () {
			self.__mongooseConnect(url);
		}, 1000);
	});

	this.mongoose.connection.on('error', function () {
		self.logger.error('Error from mongo');
	});
};

Server.prototype.stop = function () {
	process.exit(1);
};

Server.prototype.__mongooseConnect = function (url) {
	this.mongoose.connect(url, {server:{auto_reconnect:true}});
};

module.exports = Server;
