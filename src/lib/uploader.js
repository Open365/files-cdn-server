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

var settings = require('./settings');
var fs = require('fs');
var FileValidator = require('./fileValidator');
var log2out = require('log2out');
var logger = log2out.getLogger("Uploader");

var Uploader = function(cp, fileValidator) {
	this._copyFile = cp || copyFile;
	this.fileValidator = fileValidator || new FileValidator();
};

Uploader.prototype.saveFile = function(path, files, res, overwrite) {
	var outputName = files.file.outputFileName || files.file.name;

	if (files.file.size > settings.max_upload_size) {
		res.end('KO: size');
		logger.error('Failed to upload '+path+' because the size: '+files.file.size+' exceeds '+settings.max_upload_size);
		return;
	}

	if (!this.fileValidator.validateFilename(outputName)) {
		res.end('KO: name');
		logger.error('Failed to upload '+path+' because the name contains illegal characters: ' + outputName);
		return;
	}

	path = settings.upload_base_dir + path.substr('/getFile'.length);
	this._copyFile(files.file.path, path + '/' + outputName, function(err) {
		//delete temporal file
		fs.unlink(files.file.path, function (err) {
			if (err) {
				logger.error('Failed to delete temp file: '+err);
			}
		});
		if (err) {
			res.end('KO: '+err);
			logger.error('Failed to upload file to ' + path + ' because of filesystem error: '+err);
			return;
		}
		res.end('OK');
	}, overwrite);
};

function copyFile(source, target, cb, overwrite) {
	var cbCalled = false;

	var rd = fs.createReadStream(source);
	rd.on("error", function(err) {
		done(err);
	});
	var counter = 1;
	var realTarget = target;
	var ext = "";

	if(realTarget.lastIndexOf('.') !== -1) {
		realTarget = target.substr(0, target.lastIndexOf('.'));
		ext = target.substr(target.lastIndexOf('.'));
	}
	if(!overwrite) {
		while(fs.existsSync(target)) {
			target = realTarget + ' ('+counter+')'+ext;
			counter++;
		}
	}

	var wr = fs.createWriteStream(target);
	wr.on("error", function(err) {
		done(err);
	});
	wr.on("close", function(ex) {
		done();
	});
	rd.pipe(wr);

	function done(err) {
		if (!cbCalled) {
			cb(err);
			cbCalled = true;
		}
	}
}

module.exports = Uploader;
