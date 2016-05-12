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

var ServerRequestWrapper = require('../lib/serverRequestWrapper');
var Controller = require('../lib/controller');
var Provider = require('../lib/provider');
var FakeSettings = require('./utils/fakeSettings');
var Server = require('../lib/server');
var redis = require('redis');
var uploader = require('../lib/uploader');

suite('Server', function () {
	var sut;
    var serverRequestWrapper;
	var fakeRestify, controller, fakeProvider;
	var fakeRedisClient, fakeUploader;
	var mongoose, mongooseStub;

	setup(function () {
		mongoose = {
			connection: {
				on: function () {}
			},
          	connect: function () {}
      	};
		fakeRestify = require('restify').createServer();
		sinon.stub(fakeRestify);

		fakeRedisClient = require('redis');
		fakeRedisClient.createClient = sinon.stub();

		fakeUploader = {};

		fakeProvider = new Provider(fakeRedisClient);
		sinon.stub(fakeProvider);

		controller = new Controller('uuid', fakeProvider, fakeUploader);
		sinon.stub(controller);

        serverRequestWrapper = new ServerRequestWrapper(fakeRestify, controller, FakeSettings);
        sinon.stub(serverRequestWrapper);

		sut = new Server(serverRequestWrapper, mongoose, FakeSettings);
	});

	suite('#start', function () {
        setup(function() {
		});

		test('should call serverRequestWrapper startRestify', function() {
			sinon.stub(mongoose, 'connect').returns({connection: {on: function () {} }});
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.startRestify);
            sinon.assert.calledWithExactly(serverRequestWrapper.startRestify);
		});

        test('should call serverRequestWrapper addListeners', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.addListeners);
            sinon.assert.calledWithExactly(serverRequestWrapper.addListeners);
        });

        test('should call serverRequestWrapper getUserFiles', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getUserFiles);
            sinon.assert.calledWithExactly(serverRequestWrapper.getUserFiles);
        });

        test('should call serverRequestWrapper getGroupFiles', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getGroupFiles);
            sinon.assert.calledWithExactly(serverRequestWrapper.getGroupFiles);
        });

        test('should call serverRequestWrapper getPrintFiles', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getPrintFiles);
            sinon.assert.calledWithExactly(serverRequestWrapper.getPrintFiles);
        });

        test('should call serverRequestWrapper getLocalFiles', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getLocalFiles);
            sinon.assert.calledWithExactly(serverRequestWrapper.getLocalFiles);
        });

        test('should call serverRequestWrapper getSharedFiles', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getSharedFile);
            sinon.assert.calledWithExactly(serverRequestWrapper.getSharedFile);
        });

        test('should call serverRequestWrapper getNetwork', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getNetwork);
            sinon.assert.calledWithExactly(serverRequestWrapper.getNetwork);
        });

        test('should call serverRequestWrapper getFetch', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.getFetch);
            sinon.assert.calledWithExactly(serverRequestWrapper.getFetch);
        });

        test('should call serverRequestWrapper headFetch', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.headFetch);
            sinon.assert.calledWithExactly(serverRequestWrapper.headFetch);
        });

        test('should call serverRequestWrapper postFetch', function() {
            sut.start();
            sinon.assert.calledOnce(serverRequestWrapper.postFetch);
            sinon.assert.calledWithExactly(serverRequestWrapper.postFetch);
        });

		test('should call serverRequestWrapper getCSS', function() {
			sut.start();
			sinon.assert.calledOnce(serverRequestWrapper.getCSS);
			sinon.assert.calledWithExactly(serverRequestWrapper.getCSS);
		});

		test('should call serverRequestWrapper getIMG', function() {
			sut.start();
			sinon.assert.calledOnce(serverRequestWrapper.getIMG);
			sinon.assert.calledWithExactly(serverRequestWrapper.getIMG);
		});
    });

	suite('#connect', function () {
     test("should connect to mongo", function() {
		 sinon.stub(mongoose, 'connect');
         sut.connect();
         var expectedMongoUrl = 'mongodb://'
             + FakeSettings.mongo.host + ':'
             + FakeSettings.mongo.port + '/'
             + FakeSettings.mongo.db;
         sinon.assert.calledWithExactly(mongoose.connect, expectedMongoUrl, {server: {auto_reconnect: true}});
     });
 });
});
