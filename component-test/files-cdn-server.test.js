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
var EyeosHippie = require('eyeos-hippie');
var request = require('request');
var crypto = require("crypto");

suite('Files-cdn-server component-tests', function () {
	var eyeosHippie, url,
		contentFile = 'this is content for a test file',
		largeContentFile = crypto.randomBytes(50*1024*1024), // 50 MB
		baseUrl = 'https://localhost';
	var shareUrl = "/files/v2/files/";
	var filename = "file" + Math.random().toString() + ".txt";

	suiteSetup(function (done) {
		eyeosHippie = new EyeosHippie();
		//Login to platform
		eyeosHippie.login(function loginCallback() {
			//Authorize that user has permissions to folder 'Documents' (see in the upload-check.GET.har file)
			eyeosHippie.setRequestFromHar(__dirname + '/har_files/upload-check.GET.har', true)
				.parser(function(body, fn) {
					fn(null, body);
				})
				.end(function(err, res) {
					//And now we upload the file to the authorized folder
					try {
						url = JSON.parse(res.body).url;
						done();
					} catch (e) {
						done(e);
					}
				});
		}, 'eyeos', 'eyeos');
	});

	test('trying to upload a file', function(done) {
		process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
		var req = request.post(baseUrl+url, function (err, resp, body) {
			if (err) {
				console.error(err);
				return done(err);
			} else {
				done();
			}
		});
		var form = req.form();
		form.append('file', contentFile, {
			filename: filename,
			contentType: 'text/plain'
		});
	});


	// This test was added because sometimes large files fail to upload.
	//
	test.skip('trying to upload a large file', function(done) {
		var req = request.post(baseUrl+url, function (err, resp, body) {
			if (err) {
				console.error(err);
				return done(err);
			} else {
				done();
			}
		});
		var form = req.form();
		form.append('file', largeContentFile, {
			filename: filename,
			contentType: 'application/octet-stream'
		});
	});


	test.skip('trying to get uploaded file', function(done) {
		eyeosHippie.basicRequestWithCardAndSignature({
				baseUrl: baseUrl
			})
			.parser(function(body, fn) {
				fn(null, body);
			})
			.get('/userfiles/' + filename)
			.end(function(err, res) {
				url = JSON.parse(res.body).url;
				process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
				request.get(baseUrl+url, function(err, resp, body) {
					assert.equal(contentFile, body);
					done(err);
				});
			});
	});

	test('Create a shared link for a file', function(done) {
		eyeosHippie.basicRequestWithCardAndSignature({
				baseUrl: baseUrl
			})
			.post(shareUrl + encodeURIComponent("home://" + filename) + "/share")
			.parser(function(body, fn) {
				fn(null, body);
			})
			.end(function(err, res, body) {
				url = body;
				done(err);
			});
	});

	test.skip('Download the shared file without credentials', function(done) {
		eyeosHippie.basicRequest(baseUrl)
			.get(url)
			.parser(function(body, fn) {
				var match = body.match(/'(\/fetch\/[^']+)'/);
				if(match && match[1]) {
					url = match[1];
					return fn(null, match[1]);
				}
				fn(new Error("error extracting the string"));
			})
			.expectStatus(200)
			.end(function(err, res) {
				if(err) {
					return done(err);
				}
				request.get(baseUrl + url, function(err, resp, body) {
					assert.equal(contentFile, body);
					done(err);
				})
			});
	});
});
