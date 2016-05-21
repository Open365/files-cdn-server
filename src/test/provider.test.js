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

var Provider = require('../lib/provider');
var Uploader = require('../lib/uploader');

suite('Provider', function () {
	var sut, client, clientMock, res, resMock, result, uploader, uploaderMock, fakeCard;
    var resultPublic, cbWrapper, cb;

	setup(function () {
		var props = {
			url: '/fetch/id'
		};
        result = JSON.stringify(props);

		var cb = function () {};
		cbWrapper = {
			cb: cb
		};

        var propsPublic = {
            url: '/sharedfile/uuid'
        };
        resultPublic = JSON.stringify(propsPublic);


		res = {
			end: function() {
			},
			writeHead: function() {
			}
		};
		resMock = sinon.mock(res);
		client = {
			setex: function(id, ttl, path, fn) {
			},
			get: function(id) {
			},
			set:  function(id, path, fn) {

			}
		};

		fakeCard = {
			username: 'anonymous',
			domain: 'some_domain'
		};

		clientMock = sinon.mock(client);
		uploader = new Uploader();
		uploaderMock = sinon.mock(uploader);
		sut = new Provider(client, uploader);
	});

	suite('#save', function () {
		var expSetEx, expEnd, expFail, expSet;
		setup(function() {
			expSetEx = clientMock.expects('setex').once().withArgs('getFile.'+'id', 3600*4, '/getFile/some_domain/anonymous/files/path');

			expEnd = resMock.expects('end').once().withExactArgs(result);
			expFail = resMock.expects('end').once().withExactArgs('KO');
		});

		test('should call redis setex with correct parameters', function() {
			sut.save('id', 'path', fakeCard, 'files');
			expSetEx.verify();
		});

		test('should call cb with right params', function () {
			client = {
				setex: function(id, ttl, path, fn) {
				}
			};
			sut = new Provider(client);

			sinon.stub(cbWrapper, 'cb');

			sinon.stub(client, 'setex').callsArgWith(3, null, 'id');
			sut.save('id', 'path', fakeCard, 'files', cbWrapper.cb);

			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, null, result);
		});

		test('should call cb with right params if setex returns error', function () {
			client = {
				setex: function(id, ttl, path, fn) {
				}
			};
			sut = new Provider(client);

			sinon.stub(cbWrapper, 'cb');

			sinon.stub(client, 'setex').callsArgWith(3, 'err', null);
			sut.save('id', 'path', fakeCard, 'files', cbWrapper.cb);

			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, 'err', null);
		});

		test('should refuse to accept paths with ..', function() {
			client = {
				setex: function(id, ttl, path, fn) {
				}
			};
			sut = new Provider(client);

			sinon.stub(cbWrapper, 'cb');

			sinon.stub(client, 'setex').callsArgWith(3, null, 'data');
			sut.save('id', '/../lol/../', fakeCard, 'files', cbWrapper.cb);

			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, 'KO');
		});
	});

	suite('#get', function () {
		var expGet, expEndFail, expEndOK;
		setup(function() {
			expGet = clientMock.expects('get').once().withArgs('getFile.'+'id');
			expEndFail = resMock.expects('end').withExactArgs('KO');
			expEndOK = resMock.expects('end').withExactArgs('OK');
		});

		test('should call redis get with correct parameters', function() {
			sut.get('id');
			expGet.verify();
		});

		test('should call res.end with KO for incorrect id', function() {
			client = {
				get: function(id, fn) {
					fn(true);
				}
			};
			sut = new Provider(client);
			sut.get('id', res);
			expEndFail.verify();
		});

		test('should call res.end with OK for correct id', function() {
			client = {
				get: function(id, fn) {
					fn(false, true);
				}
			};
			sut = new Provider(client);
			sut.get('id', res);
			expEndOK.verify();
		});

		test('should call res.writeHead with correct params for not printed file (user or workgroup file)', function () {
			var commonPath = '/some.domain/some.user/files/some Doc.pdf';
			var getFilePath = '/getFile' + commonPath;
			client = {
				get: function (id, fn) {
					fn(null, getFilePath);
				}
			};
			var sut = new Provider(client);
			var expectation = resMock
				.expects('writeHead')
				.once()
				.withExactArgs(200, {
					'Content-Type': 'text/plain',
					'X-Accel-Redirect': encodeURIComponent(getFilePath)
				});
			sut.get('id', res);
			expectation.verify();
		});

		test('should call res.writeHead with correct params for printed file', function () {
			var commonPath = '/some.domain/some.user/print/some Doc.pdf';
			var getFilePath = '/getFile' + commonPath;
			var getPrintFilePath = '/getPrintFile' + commonPath;
			client = {
				get: function (id, fn) {
					fn(null, getFilePath);
				}
			};
			var sut = new Provider(client);
			var expectation = resMock
				.expects('writeHead')
				.once()
				.withExactArgs(200, {
					'Content-Type': 'application/pdf',
					'X-Accel-Redirect': encodeURIComponent(getPrintFilePath)
				});
			sut.get('id', res);
			expectation.verify();
		});
	});

	suite('#getView', function () {
		test("calls the response with the instance path", function () {
			var commonPath = '/some.domain/some.user/print/some Doc.pdf';
			var getFilePath = '/getFile' + commonPath;
			var expectedPath = '/getViewFile' + commonPath;
			client = {
				get: function (id, fn) {
					fn(null, getFilePath);
				}
			};
			var sut = new Provider(client);
			var expectation = resMock
				.expects('writeHead')
				.once()
				.withExactArgs(200, {
					'X-Accel-Redirect': encodeURIComponent(expectedPath)
				});
			sut.getView('id', res);
			expectation.verify();
		});
	});

	suite('#upload', function () {
		var expGet, expEndFail, expEndOK, expSaveFile;
		setup(function() {
			expGet = clientMock.expects('get').once().withArgs('getFile.'+'id');
			expEndFail = resMock.expects('end').withExactArgs('KO');
			expEndOK = resMock.expects('end').withExactArgs('OK');
			expSaveFile = uploaderMock.expects('saveFile').withExactArgs('path', 'files', res, false);
		});

		test('should call redis get with correct parameters', function() {
			sut.upload({params:{id:'id'}}, res);
			expGet.verify();
		});

		test('should call res.end with KO for incorrect id', function() {
			client = {
				get: function(id, fn) {
					fn(true);
				}
			};
			sut = new Provider(client, uploader);
			sut.upload({params:{id:'id'}}, res);
			expEndFail.verify();
		});

		test('should call uploader saveFile to save the uploaded file', function() {
			client = {
				get: function(id, fn) {
					fn(false, 'path');
				}
			};
			sut = new Provider(client, uploader);
			sut.upload({params: {id:'id'},files:'files', headers:{}}, res);
			expSaveFile.verify();
		});

		test('when overwrite header is present call uploader saveFile with correct data', function() {
			expSaveFile = uploaderMock.expects('saveFile').withExactArgs('path', 'files', res, true);
			client = {
				get: function(id, fn) {
					fn(false, 'path');
				}
			};
			sut = new Provider(client, uploader);
			sut.upload({params: {id:'id'},files:'files', headers:{"overwrite":"true"}}, res);
			expSaveFile.verify();
		})
	});
});
