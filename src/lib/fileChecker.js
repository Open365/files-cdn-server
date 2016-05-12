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
	logger = require('log2out');

var FileChecker = function (fileSystem) {
	this.fs = fileSystem || fs;
	this.logger = logger.getLogger('FileChecker');
};

FileChecker.prototype.checkIfFileExists = function (path, callback) {
	var self = this;
	this.fs.stat(path, function (err, data) {
		if (err) {
			err = 'Fs stat error for ' + path + '. Does this file exist ?';
			self.logger.error(err);
			callback(err, null);
			return;
		}
		callback(null, data);
	});
};

module.exports = FileChecker;
