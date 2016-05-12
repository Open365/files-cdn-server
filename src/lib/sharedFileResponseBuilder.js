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

var fs = require('fs'),
	settings = require('./settings'),
	bytes = require('bytes'),
	Entitites = require('html-entities').XmlEntities,
	pathlib = require('path'),
	logger = require('log2out').getLogger('ShareFileManager');

var SharedFileResponseBuilder = function (fileSystem, settingsInj) {
	this.settings = settingsInj || settings;
	this.fs = fileSystem || fs;
	this.htmlEntities = new Entitites();
};

SharedFileResponseBuilder.prototype.generateResponseHTML = function (document, fetchid, filesize, cb) {
	this.__generateHTML(fetchid, bytes(filesize), pathlib.basename(document.path), cb);
};

SharedFileResponseBuilder.prototype.__generateHTML = function (id, filesize, filename, cb) {
	var self = this;
	this.__readHTML('/../shareByUrlDownloadPage.html', function (err, html) {
		if (err) {
			logger.error('Error reading downloadPage template');
			cb(err, null);
			return;
		}
		var finalHtml = html.toString()
			.replace('%UUID%', id)
			.replace('%FILENAME%', self.htmlEntities.encode(filename))
			.replace('%FILESIZE%', filesize);
		cb(null, finalHtml);
	});
};

SharedFileResponseBuilder.prototype.generateErrorPage = function (error, cb) {
	this.__readHTML('/../shareByUrlErrorPage.html', function (err, errorPage) {
		if (err) {
			logger.error('Error reading error page template ', err);
			cb(err, null);
			return;
		}
		cb(null, errorPage.toString());
	});
};

SharedFileResponseBuilder.prototype.__readHTML = function (path, callback) {
	this.fs.readFile(__dirname + path, function (err, html) {
		callback(err, html);
	});
};

module.exports = SharedFileResponseBuilder;
