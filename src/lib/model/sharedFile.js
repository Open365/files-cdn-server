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

/**
 * ACHTUNG!
 *
 * You will find this exact same model duplicated in files-server
 * It has not been extracted into a common library because files-cdn-server
 * and files-server projects should be merged!!
 *
 */

var Schema = require('mongoose').Schema;

var SharedFileSchema = new Schema({
	id: {type: String, index: true, required: true, unique: true},
	path: {type: String, required: true, unique: false},
	username: {type: String, required: true, unique: false},
	type: {type: String, required: true, unique: false}
});

module.exports = SharedFileSchema;
