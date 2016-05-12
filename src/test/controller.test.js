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

var Controller = require('../lib/controller');
var Rng = require('../lib/rng');
var EyeosAuth = require('eyeos-auth');
var UUID = require('uuid');
var SharedFileManager = require('../lib/sharedFileManager');
var StaticFileHandler = require('../lib/staticFileHandler');
var settings = require('../lib/settings');

suite('Controller', function () {
	var sut, uuid, fakeReq, fakeRes, provider, client, eyeosAuth, eyeosAuthMock;
    var uuidStub;
	var sharedFileManager;
	var data;
	var staticFileHandler;
	var staticFileHandlerStub;

	setup(function () {
        uuid = UUID;
		data = 'data';
        uuidStub = sinon.stub(uuid, 'v4').returns('random');
		staticFileHandler = new StaticFileHandler();

		fakeReq = {
			params: {
                0: 'path%20%23path',
                'id' : 'fakeid',
				name: 'somename'
            },
			header: function() {
				return '"card"'
			},
			headers: {
				host: 'host'
			},
			isSecure: function () {
				return true;
			}
		};

		fakeRes = {
			send: function () {},
			header: function () {},
			status: function () {},
			end: function () {}
		};

		sinon.stub(fakeRes);

		provider = {
			save: function () {},
			get: function () {},
			upload: function () {}
		};

		client = {
			setex: function() {

			}
		};

		eyeosAuth = new EyeosAuth();
		eyeosAuthMock = sinon.mock(eyeosAuth);
		eyeosAuthMock.expects('verifyRequest').once().returns(true);
		sharedFileManager = new SharedFileManager({}, provider);
		staticFileHandlerStub = sinon.stub(staticFileHandler, 'getFile')
		sut = new Controller(uuid, provider, eyeosAuth, sharedFileManager, staticFileHandler);
	});

    teardown(function () {
        uuidStub.restore();
    });

	suite('handleGetFile', function () {
		test('should call v4 to calculate new document id', function() {
            sut.handleGetFile(fakeReq, 'end', 'next', 'files');
            sinon.assert.calledOnce(uuid.v4);
            sinon.assert.calledWithExactly(uuid.v4);
		});

		test('should call provider with a correct id and path', function() {
			sinon.stub(provider, 'save');
            sut.handleGetFile(fakeReq, 'end', 'next', 'files');
            sinon.assert.calledOnce(provider.save);
			sinon.assert.calledWithExactly(provider.save, 'random', 'path #path', 'card', 'files', sinon.match.func);
		});

        test('should call res with error if provider returns error', function () {
			sinon.stub(provider, 'save').callsArgWith(4, 'err', null);
			sut.handleGetFile(fakeReq, fakeRes, 'next', 'files');
			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'err');
        });

		test('should call res with data if provider save returns ok', function () {
			sinon.stub(provider, 'save').callsArgWith(4,  null, 'data');
			sut.handleGetFile(fakeReq, fakeRes, 'next', 'files');
			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'data');
		});
	});

	suite('handleFetchFile', function() {
		test('should call provider get', function() {
			sinon.stub(provider, 'get');
            sut.handleFetchFile(fakeReq, 'res', function () {});
            sinon.assert.calledOnce(provider.get);
            sinon.assert.calledWithExactly(provider.get, 'fakeid', 'res');
		});
	});

	suite('handleUploadFile', function() {
		test('should call provider upload', function() {
			sinon.stub(provider, 'upload');
			var req = { header: function () {} };
            sut.handleUploadFile(req, 'res');
            sinon.assert.calledOnce(provider.upload);
            sinon.assert.calledWithExactly(provider.upload, req, 'res');
		});
	});

	suite('#handleSharedFile', function () {

		test('should call shareFileManager handleShareFile', function () {
			sinon.stub(sharedFileManager);
			sut.handleSharedFile(fakeReq, fakeRes);
			sinon.assert.calledOnce(sharedFileManager.handleSharedFile);
			sinon.assert.calledWithExactly(sharedFileManager.handleSharedFile, fakeReq.params[0], sinon.match.func);
		});

		test('should call res.send with data on success cb if right req params', function () {
			fakeReq.params[0] = 'c1f84d09-25bf-4202-8052-b397d8f961fd';
			sinon.stub(sharedFileManager, 'handleSharedFile').callsArgWith(1, null, data);

			sut.handleSharedFile(fakeReq, fakeRes);

			sinon.assert.calledOnce(fakeRes.end);
			var dataExpected = (settings.share === 'pojo') ? JSON.stringify('data') : 'data';
			sinon.assert.calledWithExactly(fakeRes.end, dataExpected);
		});

		test('should call res.send with KO on err cb', function () {
			fakeReq.params[0] = 'c1f84d09-25bf-4202-8052-b397d8f961fd';
			sinon.stub(sharedFileManager, 'handleSharedFile').callsArgWith(1, 'KO', null);

			sut.handleSharedFile(fakeReq, fakeRes);

			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'KO');
		});

	});

	suite('#serveCSS', function () {

		test('should call staticFileHandler getFile', function () {
			sut.serveCSS(fakeReq, fakeRes);
			sinon.assert.calledOnce(staticFileHandler.getFile);
			sinon.assert.calledWithExactly(staticFileHandler.getFile, '../css/' + fakeReq.params.name, sinon.match.func);
		});

		test('should call res with 404 if error on getFile', function () {
			staticFileHandlerStub.callsArgWith(1, 'error', null);
			sut.serveCSS(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.status);
			sinon.assert.calledWithExactly(fakeRes.status ,404);
		});

		test('should call res end with ko if error on get file', function () {
			staticFileHandlerStub.callsArgWith(1, 'error', null);
			sut.serveCSS(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'KO');
		});

		test('should call res header with content type if staticFileHandler getFile callback is ok', function () {
			staticFileHandlerStub.callsArgWith(1, null, 'data');
			sut.serveCSS(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.header);
			sinon.assert.calledWithExactly(fakeRes.header, 'Content-Type', 'text/css');
		});

		test('should call res end with data if staticFileHandler getFile callback is ok', function () {
			staticFileHandlerStub.callsArgWith(1, null, 'data');
			sut.serveCSS(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'data');
		});

	});
	
	suite('#serveIMG', function () {

		test('should call staticFileHandler getFile', function () {
			sut.serveIMG(fakeReq, fakeRes);
			sinon.assert.calledOnce(staticFileHandler.getFile);
			sinon.assert.calledWithExactly(staticFileHandler.getFile, '../img/' + fakeReq.params.name, sinon.match.func);
		});

		test('should call res with 404 if error on getFile', function () {
			staticFileHandlerStub.callsArgWith(1, 'error', null);
			sut.serveIMG(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.status);
			sinon.assert.calledWithExactly(fakeRes.status ,404);
		});

		test('should call res end with ko if error on get file', function () {
			staticFileHandlerStub.callsArgWith(1, 'error', null);
			sut.serveIMG(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'KO');
		});

		test('should call res header with content type if staticFileHandler getFile callback is ok', function () {
			staticFileHandlerStub.callsArgWith(1, null, 'data');
			sut.serveIMG(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.header);
			sinon.assert.calledWithExactly(fakeRes.header, 'Content-Type', 'image/png');
		});

		test('should call res end with data if staticFileHandler getFile callback is ok', function () {
			staticFileHandlerStub.callsArgWith(1, null, 'data');
			sut.serveIMG(fakeReq, fakeRes);
			sinon.assert.calledOnce(fakeRes.end);
			sinon.assert.calledWithExactly(fakeRes.end, 'data');
		});

	});

});
