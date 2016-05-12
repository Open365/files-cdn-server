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

var FileChecker = require('../lib/fileChecker'),
	fs = require('fs'),
	sinon = require('sinon');

suite('FileChecker', function () {
	var sut;
	var path = '/some/real/fs/path';
	var cbWrapper;
	var fsStub;
	var fakeFileData;

	setup(function () {
		fsStub = sinon.stub(fs, 'stat');
		fakeFileData = {
			size: 500
		};
		cbWrapper = {
			cb: function () {}
		};
		sut = new FileChecker(fs);
	});

	teardown(function () {
		fsStub.restore();
	});

	suite('#checkIfFileExists', function () {

		test('shoud call fs stat', function () {
			sut.checkIfFileExists(path, cbWrapper.cb);
			sinon.assert.calledOnce(fs.stat);
			sinon.assert.calledWithExactly(fs.stat, path, sinon.match.func);
		});
		
		test('should call callback with error if error from fs.stat', function () {
			fsStub.callsArgWith(1, 'err', null);
			sinon.stub(cbWrapper, 'cb');
			sut.checkIfFileExists(path, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, 'Fs stat error for ' + path + '. Does this file exist ?', null);
		});

		test('should call callback with data if no error on fs stat', function () {
			fsStub.callsArgWith(1, null, fakeFileData);
			sinon.stub(cbWrapper, 'cb');
			sut.checkIfFileExists(path, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, null, fakeFileData);
		});
		
		
	});
});
