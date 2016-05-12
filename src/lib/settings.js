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

var environment = process.env;
var mountPointRoot = '/mnt/eyeosFS/';

var Settings = {
	redis_host: environment.EYEOS_FILES_CDN_SERVER_REDIS_HOST || 'redis.service.consul',
	redis_port: environment.EYEOS_FILES_CDN_SERVER_REDIS_PORT || 6379,
	redisNoReadyCheck: environment.EYEOS_FILES_CDN_SERVER_REDIS_NO_READY_CHECK === 'true' || false,
	mountPointRoot: environment.EYEOS_FILES_CDN_SERVER_MOUNTPOINT_DIR || mountPointRoot,
	upload_base_dir: environment.EYEOS_FILES_CDN_SERVER_BASE_DIR || mountPointRoot + 'users/',
	max_upload_size: environment.EYEOS_FILES_CDN_SERVER_MAX_UPLOAD_SIZE || 209715200, //200mb
	securityStatus : environment.EYEOS_FILES_CDN_SERVER_SECURITY_STATUS || "secure",
    filesCdnPort: +environment.EYEOS_FILES_CDN_SERVER_PORT || 8090,
	mongo: {
		host: environment.EYEOS_FILES_CDN_SERVER_MONGO_HOST || 'mongo.service.consul',
		port: environment.EYEOS_FILES_CDN_SERVER_MONGO_PORT || 27017,
		db: environment.EYEOS_FILES_CDN_SERVER_MONGO_DB || 'eyeos'
	},
	share: 'page' // page||pojo Temporal feature toggling, will be removed.
};

module.exports = Settings;
