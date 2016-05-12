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

var Uploader = require('../lib/uploader');
var settings = require('../lib/settings');
var FileValidator = require('../lib/fileValidator');

suite('Uploader', function () {
	var sut, fakeRes, resMock, fileValidator, fileValidatorMock, fakeFile, fakeFileWithOutputName;

	setup(function () {
		fakeRes = {
			end: function() {

			}
		};
		fakeFile = {
			file: {
				name: 'filename',
				size: 209715200
			}
		};
		fakeFileWithOutputName = {
			file: {
				outputFileName: 'outputFileName',
				name: 'filename',
				size: 209715200
			}
		};
		resMock = sinon.mock(fakeRes);
		var f = function() {}; //fake copyFile
		fileValidator = new FileValidator();
		fileValidatorMock = sinon.mock(fileValidator);
		sut = new Uploader(f, fileValidator);
	});

	suite('#saveFile', function () {
		var expFailSize, expFailName;
		setup(function() {
			expFailSize = resMock.expects('end').once().withExactArgs('KO: size');
			expFailName = resMock.expects('end').once().withExactArgs('KO: name');
		});

		test('should fail for max_file_size', function(){
			sut.saveFile('path', {file:{size: 209715201}}, fakeRes);
			expFailSize.verify();
		});

		test('should call fileValidator.validateFilename with file.outputFileName if there is outputFileName in file param', function(){
			fileValidatorMock.expects('validateFilename')
				.once()
				.withExactArgs(fakeFileWithOutputName.file.outputFileName)
				.returns(false);
			sut.saveFile('path', fakeFileWithOutputName, fakeRes);
			expFailName.verify();
		});
		
		test('should call fileValidator.validateFilename with file.name if there is no outputFileName in file param', function () {
			fileValidatorMock.expects('validateFilename')
				.once()
				.withExactArgs(fakeFile.file.name)
				.returns(false);
			sut.saveFile('path', fakeFile, fakeRes);
			expFailName.verify();
		});

		test('should call FileValidator validateFilename with correct name', function(){
			fileValidatorMock.expects('validateFilename').once().withExactArgs('name');
			sut.saveFile('path', {file:{size: 209715200, name: 'name'}}, fakeRes);
			expFailName.verify();
		});
	});
});
