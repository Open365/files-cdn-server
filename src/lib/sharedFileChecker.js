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

var logger = require('log2out'),
	eyeOSSchemes = require('eyeos-schemes'),
	settings = require('./settings'),
	path = require('path'),
	FileChecker = require('./fileChecker'),
	SharedFileProvider = require('./sharedFileProvider');

var SharedFileChecker = function (sharedFileProvider, schemeResolver, settingsInj, fileChecker) {
	this.logger = logger.getLogger('SharedFileChecker');
	this.settings = settingsInj || settings;
	this.sharedFileProvider = sharedFileProvider || new SharedFileProvider();
	this.schemeResolver = schemeResolver || eyeOSSchemes.getResolver('filesystem', {mountPoint: this.settings.mountPointRoot});
	this.fileChecker = fileChecker || new FileChecker();
};

SharedFileChecker.prototype.__checkIfFileExists = function (document, callback) {
	var path = this.settings.upload_base_dir + document.username + '/' + document.type + document.path;
	this.fileChecker.checkIfFileExists(path, callback);
};

SharedFileChecker.prototype.checkIfSharedFileExists = function (id, cb) {
	var self = this;
	this.sharedFileProvider.getSharedFile(id, function (err, document) {
		if (err || !document) {
			err = 'Nonexistent shared document with id '+ id;
			self.logger.debug(err);
			cb(err, null);
		} else {
			self.logger.debug('Existing document sharedfile for document ', document);
			document.type = self.__getFileTypeFromScheme(document.type, document.username);
			// Once we know the document path, we can check whether it really exists or not
			self.__checkIfFileExists(document, function (err, data) {
				if (err) {
					self.__removeSharedDocument(id, cb);
					return;
				}
				cb(null, document, data.size);
			});
		}
	});
};

SharedFileChecker.prototype.__removeSharedDocument = function (id, callback) {
	this.sharedFileProvider.remove(id, function (err, data) {
		if (err) {
			self.logger.debug('Nonexistent shared document with id '+ id + ' could not be removed from persistence');
		}
		callback('Nonexistent shared document with id ' + id + ' removed from persistence', null);
	});
};

SharedFileChecker.prototype.__getFileTypeFromScheme = function (scheme, username) {
	return path.basename(this.schemeResolver.getPath(scheme + '://', username));
};

module.exports = SharedFileChecker;
