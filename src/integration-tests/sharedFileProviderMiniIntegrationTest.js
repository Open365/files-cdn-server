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

var mongoose = require('mongoose');
	settings = require('src/lib/settings'),
	uuid = require('uuid'),
	SharedFile = require('src/lib/model/sharedFile');
	SharedFileProvider = require('src/lib/sharedFileProvider');


mongoose.connect('mongodb://' + settings.mongo.host + '/' + settings.mongo.db);

var sharedFile = mongoose.model('sharedfile', SharedFile);

var id = uuid.v4();

sharedFile.create({id: id, path: '/Documents/Untitled 1.doc', username: 'eyeos', type: 'files'}, function (err, document) {
	if (err) {
		console.error('Create error ', err);
	} else {
		console.log('Document created ', document.id);

		var sfp = new SharedFileProvider();

		sfp.getSharedFile(id, function (err, document) {
			if (err) {
				console.error('get error ',err);
			} else {
				console.log('Document found ', document);
				sharedFile.remove({id: id}, function (err, doc) {
					if (err) {
						console.error('Error deleting doc ',document.id);
					}
				});
			}
		});
	}
});







