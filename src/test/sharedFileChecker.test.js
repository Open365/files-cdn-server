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

var SharedFileChecker = require('../lib/sharedFileChecker'),
	sinon = require('sinon'),
	FakeSettings = require('./utils/fakeSettings'),
	FileChecker = require('../lib/fileChecker'),
	SharedFileProvider = require('../lib/sharedFileProvider')

suite('SharedFileChecker', function () {
	var sut;
	var sharedFileProvider;
	var id, cb, cbWrapper, fakeDoc;
	var fileChecker;

	setup(function () {
		cb = function () {};
		cbWrapper = {
			cb: cb
		};
		fileChecker = new FileChecker();
		fakeDoc = {
			type: 'home',
			username: 'user',
			path: '/Some/path'
		};

		sinon.stub(cbWrapper);

		sharedFileProvider = new SharedFileProvider();

		id = 'id';

		sut = new SharedFileChecker(sharedFileProvider, null, FakeSettings, fileChecker);
	});

	teardown(function () {

	});

	suite('#checkIfSharedFileExists', function () {

		test('should call sharedFileProvider getSharedFile', function () {
			var st = sinon.stub(sharedFileProvider, 'getSharedFile');
			sut.checkIfSharedFileExists(id, cb);
			sinon.assert.calledOnce(sharedFileProvider.getSharedFile);
			sinon.assert.calledWithExactly(sharedFileProvider.getSharedFile, id, sinon.match.func);
			st.restore();
		});

		test('should call fileChecker checkIfFileExists on getSharedFile callback with document if no error', function () {
			var path = FakeSettings.upload_base_dir + fakeDoc.username + '/files' + fakeDoc.path;
			var st = sinon.stub(sharedFileProvider, 'getSharedFile').callsArgWith(1, null, fakeDoc);
			sinon.stub(fileChecker, 'checkIfFileExists');
			sut.checkIfSharedFileExists(id, cbWrapper.cb);
			sinon.assert.calledOnce(fileChecker.checkIfFileExists);
			sinon.assert.calledWithExactly(fileChecker.checkIfFileExists, path, sinon.match.func);
			st.restore();
		});

		test('should call callback param on getSharedFile callback with err if error', function () {
			var st = sinon.stub(sharedFileProvider, 'getSharedFile').callsArgWith(1, 'err', null);
			sut.checkIfSharedFileExists(id, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, 'Nonexistent shared document with id '+ id, null);
			st.restore();
		});

	});
});
