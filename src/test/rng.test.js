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

var Rng = require('../lib/rng');

suite('Rng', function () {
	var sut;

	setup(function () {
		sut = new Rng();
	});

	suite('#getRandomNumber', function () {
		test('should return random numbers of 40 bytes length', function() {
			var rn = sut.getRandomNumber();
			assert(40, rn.length);
		});

		test('should return random numbers', function() {
			var rn = sut.getRandomNumber();
			var rn2 = sut.getRandomNumber();
			assert.notEqual(rn, rn2);
		});
	});
});