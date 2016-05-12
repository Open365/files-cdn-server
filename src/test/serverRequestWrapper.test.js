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
var ServerRequestWrapper= require('../lib/serverRequestWrapper');
var Provider = require('../lib/provider');
var settings = require('./utils/fakeSettings.js');
var uuid = require('uuid');

suite('ServerRequestWrapper', function () {
    var sut;
    var restifyStub, restifyGetStub, restifyHeadStub, restifyPostStub, restifyListenStub, restifyUseStub, restifyOnStub, restifyServer;
    var controller, controllerStub;
    var fakeReq, fakeRes, fakeNext;
	var provider;

    setup(function () {
        restifyServer = {
            get: function (req, cb) {},
            head: function (req, cb) {},
            post: function (req, cb) {},
            listen: function (port, cb) {},
            on: function (exception, cb) {},
            use: function (body) {}
        };

		provider = new Provider({});
		sinon.stub(provider);

        controller = new Controller(null, provider);
        controllerStub = sinon.stub(controller);

        fakeReq = "fakeReq";
        fakeRes = "fakeRes";
        fakeNext = "fakeNext";

        sut = new ServerRequestWrapper(restifyServer, controller, settings);
    });

    teardown(function () {

    });

    suite('#getUserFiles', function () {

        test('should call restify.get() with param userfiles regex', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getUserFiles();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, /^\/userfiles\/(.*)/, sinon.match.func);
        });

        test('should have callback execute controller.handleGetFile with last argument as files', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getUserFiles(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleGetFile);
            sinon.assert.calledWithExactly(controllerStub.handleGetFile, fakeReq, fakeRes, fakeNext, 'files')
        });

    });

    suite('#getGroupFiles', function () {

        test('should call restify.get() with param groupfiles regex', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getGroupFiles();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, /^\/groupfiles\/(.*)/, sinon.match.func);
        });

        test('should have callback execute controller.handleGetFile with last argument as workgroups', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getGroupFiles(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleGetFile);
            sinon.assert.calledWithExactly(controllerStub.handleGetFile, fakeReq, fakeRes, fakeNext, 'workgroups')
        });

    });

    suite('#getPrintFiles', function () {

        test('should call restify.get() with param printfiles regex', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getPrintFiles();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, /^\/printfiles\/(.*)/, sinon.match.func);
        });

        test('should have callback execute controller.handleGetFile with last argument as print', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getPrintFiles(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleGetFile);
            sinon.assert.calledWithExactly(controllerStub.handleGetFile, fakeReq, fakeRes, fakeNext, 'print')
        });

    });

    suite('#getLocalFiles', function () {

        test('should call restify.get() with param localfiles regex', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getLocalFiles();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, /^\/localfiles\/(.*)/, sinon.match.func);
        });

        test('should have callback execute controller.handleGetFile with last argument as local', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getLocalFiles(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleGetFile);
            sinon.assert.calledWithExactly(controllerStub.handleGetFile, fakeReq, fakeRes, fakeNext, 'local')
        });

    });

    suite('#getSharedFile', function () {

        test('should call restify.get() with param sharedfile regex', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getSharedFile();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, /^\/sharedfile\/(.*)/, sinon.match.func);
        });

        test('should have callback execute controller.handleSharedFile', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getSharedFile(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleSharedFile);
            sinon.assert.calledWithExactly(controllerStub.handleSharedFile, fakeReq, fakeRes, fakeNext);
        });

    });

    suite('#getNetwork', function () {

        test('should call restify.get() with param network regex', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getNetwork();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, /^\/network\/(.*)/, sinon.match.func);
        });

        test('should have callback execute controller.handleGetFile with last argument as networkdrives', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getNetwork(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleGetFile);
            sinon.assert.calledWithExactly(controllerStub.handleGetFile, fakeReq, fakeRes, fakeNext, 'networkdrives')
        });

    });

    suite('#getFetch', function () {

        test('should call restify.get() with param /fetch/:id', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getFetch();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, '/fetch/:id', sinon.match.func);
        });

        test('should have callback execute controller.handleFetchFile', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getFetch(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleFetchFile);
            sinon.assert.calledWithExactly(controllerStub.handleFetchFile, fakeReq, fakeRes, fakeNext)
        });

    });

    suite('#getFetchView', function () {

        test('should call restify.get() with param /fetch/:id/view', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.getFetchView();
            sinon.assert.calledOnce(restifyStub.get);
            sinon.assert.calledWithExactly(restifyStub.get, '/fetch/:id/view', sinon.match.func);
        });

        test('should have callback execute controller.handleFetchFile', function () {
            restifyGetStub = sinon.stub(restifyServer, 'get');
            restifyGetStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.getFetchView(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleFetchFileView);
            sinon.assert.calledWithExactly(controllerStub.handleFetchFileView, fakeReq, fakeRes, fakeNext)
        });

    });

    suite('#headFetch', function () {

        test('should call restify.head() with param /fetch/:id', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.headFetch();
            sinon.assert.calledOnce(restifyStub.head);
            sinon.assert.calledWithExactly(restifyStub.head, '/fetch/:id', sinon.match.func);
        });

        test('should have callback execute controller.handleFetchFile', function () {
            restifyHeadStub = sinon.stub(restifyServer, 'head');
            restifyHeadStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.headFetch(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleFetchFile);
            sinon.assert.calledWithExactly(controllerStub.handleFetchFile, fakeReq, fakeRes, fakeNext)
        });

    });

    suite('#postFetch', function () {

        test('should call restify.post() with param /fetch/:id', function () {
            restifyStub = sinon.stub(restifyServer);
            sut.postFetch();
            sinon.assert.calledOnce(restifyStub.post);
            sinon.assert.calledWithExactly(restifyStub.post, '/fetch/:id', sinon.match.func);
        });

        test('should have callback execute controller.handleUploadFile', function () {
            restifyPostStub = sinon.stub(restifyServer, 'post');
            restifyPostStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
            sut.postFetch(fakeReq, fakeRes, fakeNext);
            sinon.assert.calledOnce(controllerStub.handleUploadFile);
            sinon.assert.calledWithExactly(controllerStub.handleUploadFile, fakeReq, fakeRes, fakeNext);
        });

    });

    suite('#startRestify', function () {

        test('should call restify.use passing a function as param', function() {
            restifyUseStub = sinon.stub(restifyServer, 'use');
            sut.startRestify();
            sinon.assert.calledWithMatch(restifyUseStub, sinon.match.func);
        });

        test('should call restify.listen passing a port param from settings file', function() {
            restifyListenStub = sinon.stub(restifyServer, 'listen');
            sut.startRestify();
            sinon.assert.calledWithMatch(restifyListenStub, sinon.match.number);
        });
    });

    suite('#addListeners', function () {

        test('should call restify.on passing param uncaughtException and callback', function() {
            restifyOnStub = sinon.stub(restifyServer, 'on');
            sut.addListeners();
            sinon.assert.calledWith(restifyOnStub, 'uncaughtException', sinon.match.func);
        });
    });
	
	suite('#getCSS', function () {
		
		test('should call restify get with param sharedfile/css', function () {
			restifyStub = sinon.stub(restifyServer);
			sut.getCSS();
			sinon.assert.calledOnce(restifyStub.get);
			sinon.assert.calledWithExactly(restifyStub.get, '/sharedfile/css/:name', sinon.match.func);
		});

		test('restify callback should call controller serveCSS', function () {
			restifyPostStub = sinon.stub(restifyServer, 'get');
			restifyPostStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
			sut.getCSS(fakeReq, fakeRes, fakeNext);
			sinon.assert.calledOnce(controllerStub.serveCSS);
			sinon.assert.calledWithExactly(controllerStub.serveCSS, fakeReq, fakeRes, fakeNext);
		});
			 
	});

	suite('#getIMG', function () {

		test('should call restify get with param sharedfile/css', function () {
			restifyStub = sinon.stub(restifyServer);
			sut.getIMG();
			sinon.assert.calledOnce(restifyStub.get);
			sinon.assert.calledWithExactly(restifyStub.get, '/sharedfile/img/:name', sinon.match.func);
		});

		test('restify callback should call controller serveIMG', function () {
			restifyPostStub = sinon.stub(restifyServer, 'get');
			restifyPostStub.callsArgWith(1, fakeReq, fakeRes, fakeNext);
			sut.getIMG(fakeReq, fakeRes, fakeNext);
			sinon.assert.calledOnce(controllerStub.serveIMG);
			sinon.assert.calledWithExactly(controllerStub.serveIMG, fakeReq, fakeRes, fakeNext);
		});

	});
});
