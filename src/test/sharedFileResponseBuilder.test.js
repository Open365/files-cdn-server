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

var SharedFileResponseBuilder = require('../lib/sharedFileResponseBuilder'),
	sinon = require('sinon'),
	pathlib = require('path'),
	bytes = require('bytes'),
	FakeSettings = require('./utils/fakeSettings');

suite('SharedFileResponseBuilder', function () {
	var sut;
	var fakeFs;
	var fakeDoc,
		fsStatData,
		fakeHTML,
		readFileStub,
		protocol,
		domain,
		filesize,
		cbWrapper, fetchId;

	setup(function () {
		protocol = 'protocol';
		domain = 'domain';
		filesize = 500;
		fakeHTML = '<!DOCTYPE html><html><head lang="en"><meta charset="UTF-8"><title>Download page</title></head><body><div class="sharedbyurl"><h2>%FILENAME%</h2><br><h3>%FILESIZE%</h3><a href="domain/fetch/%UUID%" download>Download!</a></div></body></html>';
		fakeFs = {
			readFile: function () {

			},
			stat: function () {

			}
		};
		cbWrapper = {
			cb: function () {
			}
		};
		fakeDoc = {
			username: 'username',
			type: 'files',
			id: 'id',
			path: '/path/file.doc'
		};
		fsStatData = {
			size: filesize
		};
		sinon.stub(cbWrapper, 'cb');
		readFileStub = sinon.stub(fakeFs, 'readFile');
		fetchId = 'a33f738b-9fdc-4c75-a32c-33458a25216a';
		sut = new SharedFileResponseBuilder(fakeFs, FakeSettings);
	});

	teardown(function () {

	});

	suite('#generateResponseHTML', function () {

		test('should call fs.read file', function () {
			sinon.stub(fakeFs, 'stat').callsArgWith(1, null, fsStatData);
			sut.generateResponseHTML(fakeDoc, cbWrapper.cb);
			sinon.assert.calledOnce(fakeFs.readFile);
			sinon.assert.calledWithExactly(fakeFs.readFile, sinon.match('/../shareByUrlDownloadPage.html'), sinon.match.func);
		});

		test('should call cb with error on readFile err', function () {
			sinon.stub(fakeFs, 'stat').callsArgWith(1, null, fsStatData);
			readFileStub.callsArgWith(1, 'err', null);
			sut.generateResponseHTML(fakeDoc, fetchId, filesize, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, 'err', null);
		});

		test('should call cb with right html when readFile successful', function () {
			sinon.stub(fakeFs, 'stat').callsArgWith(1, null, fsStatData);
			readFileStub.callsArgWith(1, null, fakeHTML);
			sut.generateResponseHTML(fakeDoc, fetchId, filesize, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, null, fakeHTML
				.replace('%UUID%', fetchId)
				.replace('%FILENAME%', pathlib.basename(fakeDoc.path))
				.replace('%FILESIZE%', bytes(fsStatData.size), null));
		});
	});
	
	suite('#generateErrorPage', function () {
		
		test('should call fs readFile', function () {
			sut.generateErrorPage('err', function () {});
			sinon.assert.calledOnce(fakeFs.readFile);
			sinon.assert.calledWithExactly(fakeFs.readFile, sinon.match('/../shareByUrlErrorPage.html'), sinon.match.func);
		});
		
		test('should call cb err when error received', function () {
			readFileStub.callsArgWith(1, 'err', null);
			sut.generateErrorPage('err', cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, 'err', null);
		});

		test('should call cb with html page if fs read ok', function () {
			sinon.stub(fakeFs, 'stat').callsArgWith(1, null, fsStatData);
			readFileStub.callsArgWith(1, null, fakeHTML);
			sut.generateErrorPage(fakeDoc, cbWrapper.cb);
			sinon.assert.calledOnce(cbWrapper.cb);
			sinon.assert.calledWithExactly(cbWrapper.cb, null, fakeHTML);
		});
			 
	});
});
