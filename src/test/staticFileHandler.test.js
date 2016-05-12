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

var StaticFileHandler = require('../lib/staticFileHandler'),
	fs = require('fs'),
	pathLib = require('path'),
	sinon = require('sinon');

suite('StaticFileHandler', function () {
	var sut;
	var fsStub;
	var path;
	var cbWrapper;
	var fullPath;
	var pathStub;

	setup(function () {
		path = 'some/file/path';
		fullPath = 'a/now/complete/' + path;
		cbWrapper = {
			cb: function () {

			}
		};
		fsStub = sinon.stub(fs, 'readFile');
		pathStub = sinon.stub(pathLib, 'resolve').returns(fullPath);
		sut = new StaticFileHandler(fs, pathLib);
	});

	teardown(function () {
		fsStub.restore();
		pathStub.restore();
	});

	suite('#getFile', function () {

		test('should call fs readFile', function () {
			sut.getFile(path, cbWrapper.cb);
			sinon.assert.calledOnce(fs.readFile);
			sinon.assert.calledWithExactly(fs.readFile, fullPath, sinon.match.func)
		});

		test('should call callback after fs readFile is completed', function () {
			sinon.stub(cbWrapper, 'cb');
			fsStub.callsArgWith(1, 'ou', 'yeah')
			sut.getFile(path, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
		});

	});
});
