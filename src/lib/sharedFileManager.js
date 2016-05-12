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

var SharedFileChecker = require('./sharedFileChecker'),
	Provider = require('./provider'),
	SharedFileResponseBuilder = require('./sharedFileResponseBuilder'),
	settings = require('./settings'),
	logger = require('log2out'),
	pathlib = require('path'),
	bytes = require('bytes'),
	uuid = require('uuid');

var SharedFileManager = function (sharedFileChecker, provider, sharedFileResponseBuilder, injectedUUID) {
	this.sharedFileChecker = sharedFileChecker || new SharedFileChecker();
	this.logger = logger.getLogger('ShareFileManager');
	this.provider = provider || new Provider();
	this.sharedFileResponseBuilder = sharedFileResponseBuilder || new SharedFileResponseBuilder();
	this.uuid = injectedUUID || uuid;
};


SharedFileManager.prototype.handleSharedFile = function (id, cb) {
	var self = this;
	this.sharedFileChecker.checkIfSharedFileExists(id,
		function fileFound (err, document, filesize) {
			if (err) {
				self.logger.warn('File with id ' + id + ' not found');
				if(settings.share === 'pojo') {
					cb(err, null);
				} else {
					self.sharedFileResponseBuilder.generateErrorPage(err, cb);
				}
				return;
			}
			// Persist document into redis so it can be fetched later
			var fetchId = self.uuid.v4();
			self.provider.save(fetchId, document.path, {username: document.username}, document.type,
				function documentSaved(err, data) {
					if (err) {
						self.logger.error('Error saving document ' + document.id + ' with path ' + document.path + ' to redis: ', err);
						cb(err, null);
						return;
					}
					if(settings.share === 'pojo') {
						cb(null, {name: pathlib.basename(document.path), size: bytes(filesize), id: fetchId});
					} else {
						// Everything done, generate HTML and call request callback so it can send response
						self.sharedFileResponseBuilder.generateResponseHTML(document, fetchId, filesize, cb);
					}
				}
			);
		}
	);
};

module.exports = SharedFileManager;
