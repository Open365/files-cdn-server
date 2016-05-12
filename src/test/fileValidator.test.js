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

var sinon = require('sinon');
var assert = require('chai').assert;
var FileValidator = require('../lib/fileValidator');

suite('FileValidator', function () {
	var sut;
	var filenamesWithInvalidChars = [
		"a\\b",
		"a/b",
		"a:b",
		"a*b",
		"a?b",
		'a"b',
		"a<b",
		"a>b",
		"a|b",
		"a\0b"
	];

	var validFilenames = [
		"a valid filename",
		"bla bla bla bla",
		"a",
		"    "
	];

	setup(function () {
		sut = new FileValidator();
	});

	/**
	 * Method: validateFilename
	 */
	test("isInvalid when passed an empty file should return false", sinon.test(function () {
		var actual = sut.validateFilename("");
		assert.equal(false, actual);
	}));

	function validateInvalidFilename (filename) {
		return function () {
			var actual = sut.validateFilename(filename);
			assert.equal(false, actual);
		}
	}

	filenamesWithInvalidChars.forEach(function (item) {
		/**
		 * Method: validateFilename
		 */
		test("validateFilename when passed a filename with invalid characters [" + item + "] should return EINVAL", validateInvalidFilename(item));
	});

	function validateValidFilename (filename) {
		return function () {
			var actual = sut.validateFilename(filename);
			assert.equal(true, actual);
		}
	}

	validFilenames.forEach(function (item) {
		/**
		 * Method: validateFilename
		 */
		test("validateFilename when passed a valid filename [" + item + "] should return false", validateValidFilename(item));
	});

	/**
	 * Method: validateFilename
	 */
	test("validateFilename when passed a filename with 201 chars should return false", sinon.test(function () {
		var filename = "";
		for (var i = 1; i <= 201; i++) {
			filename += "a";
		}
		var actual = sut.validateFilename(filename);
		assert.equal(false, actual);
	}));

	/**
	 * Method: validateFilename
	 */
	test("validateFilename when passed a filename with more than 200 chars should return ENAMETOOLONG", sinon.test(function () {
		var filename = "";
		for (var i = 1; i <= 201; i++) {
			filename += "a";
		}
		var actual = sut.validateFilename(filename);
		assert.equal(false, actual);
	}));

	/**
	 * Method: validateFilename
	 */
	test("validateFilename when filename is '.' should return EINVAL", sinon.test(function () {
		var actual = sut.validateFilename('.');
		assert.equal(false, actual);
	}));

	/**
	 * Method: validateFilename
	 */
	test("validateFilename when filename is '..' should return EINVAL", sinon.test(function () {
		var actual = sut.validateFilename('..');
		assert.equal(false, actual);
	}));
});
