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

var SharedFileManager = require('../lib/sharedFileManager');
var SharedFileChecker = require('../lib/sharedFileChecker');
var SharedFileResponseBuilder = require('../lib/sharedFileResponseBuilder');
var sinon = require('sinon');
var uuid = require('uuid');
var settings = require('../lib/settings');
var bytes = require('bytes');

suite('ShareFileManager', function () {
	var sut,
		sharedFileChecker,
		id, cb, cbWrapper, fakeDocument, fakeProvider,
		sharedFileResponseBuilder,
		protocol, domain,
		fakeFileSize, uuidV4, uuidV4Stub,
		documentPath, documentFileName;

	setup(function () {
		protocol = 'protocol';
		domain = 'domain';
		id = 'id';
		cb = function () {};
		cbWrapper = {
			cb: cb
		};
		fakeFileSize = 3000;
		sinon.stub(cbWrapper, 'cb');
		fakeProvider = {
			save: function (err, data) {}
		};

		sharedFileResponseBuilder = new SharedFileResponseBuilder();

		documentPath = 'path/in/';
		documentFileName = 'doc.txt';

		fakeDocument = {
			id: id,
			path: documentPath + documentFileName,
			type: 'type',
			username: 'username'
		};
		sharedFileChecker = new SharedFileChecker();
		uuidV4 = 'a33f738b-9fdc-4c75-a32c-33458a25216a';
		uuidV4Stub = sinon.stub(uuid, 'v4').returns(uuidV4);

		sut = new SharedFileManager(sharedFileChecker, fakeProvider, sharedFileResponseBuilder, uuid);
	});

	teardown(function () {
		uuidV4Stub.restore();
	});

	suite('#handleSharedFile', function () {

		test('should call sharedFileChecker checkIfSharedFileExists', function () {
			sinon.stub(sharedFileChecker, 'checkIfSharedFileExists');
			sut.handleSharedFile(id, cb);
			sinon.assert.calledOnce(sharedFileChecker.checkIfSharedFileExists);
			sinon.assert.calledWithExactly(sharedFileChecker.checkIfSharedFileExists, id, sinon.match.func);
		});

		test('should call cb with error if file not found', function () {
			sinon.stub(sharedFileChecker, 'checkIfSharedFileExists').callsArgWith(1, 'err', null);
			sinon.stub(sharedFileResponseBuilder, 'generateErrorPage')
			sut.handleSharedFile(id, cbWrapper.cb);
			sinon.assert.calledOnce(sharedFileResponseBuilder.generateErrorPage);
			sinon.assert.calledWithExactly(sharedFileResponseBuilder.generateErrorPage, 'err', cbWrapper.cb);
		});

		test('should call provider save if file found in persistence', function () {
			var st = sinon.stub(fakeProvider, 'save');
			sinon.stub(sharedFileChecker, 'checkIfSharedFileExists').callsArgWith(1, null, fakeDocument);
			sut.handleSharedFile(id, cbWrapper.cb);
			sinon.assert.calledOnce(fakeProvider.save);
			sinon.assert.calledWithExactly(fakeProvider.save, uuidV4, fakeDocument.path, {username: fakeDocument.username}, fakeDocument.type, sinon.match.func);
			st.restore();
		});

		if (settings.share === 'pojo') {
			test('provider save callback should call callback with correct data', function () {
				sinon.stub(sharedFileResponseBuilder, 'generateResponseHTML');
				sinon.stub(sharedFileChecker, 'checkIfSharedFileExists').callsArgWith(1, null, fakeDocument, fakeFileSize);
				sinon.stub(fakeProvider, 'save').callsArgWith(4, null, {});
				var callback = sinon.mock();
				sut.handleSharedFile(id, callback);
				sinon.assert.calledWithExactly(callback, null, {name: documentFileName, size: bytes(fakeFileSize), id: uuidV4});
			});
		} else {
			test('provider save callback should call sharedFileResponseBuilder.generateResponseHTML', function () {
				sinon.stub(sharedFileResponseBuilder, 'generateResponseHTML');
				sinon.stub(sharedFileChecker, 'checkIfSharedFileExists').callsArgWith(1, null, fakeDocument, fakeFileSize);
				sinon.stub(fakeProvider, 'save').callsArgWith(4, null, {});
				sut.handleSharedFile(id, cbWrapper.cb);
				sinon.assert.calledOnce(sharedFileResponseBuilder.generateResponseHTML);
				sinon.assert.calledWithExactly(sharedFileResponseBuilder.generateResponseHTML, fakeDocument, uuidV4, fakeFileSize, cbWrapper.cb);
			});
		}


	});

});
