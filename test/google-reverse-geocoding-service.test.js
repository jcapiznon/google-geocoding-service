'use strict';

var _      = require('lodash'),
	cp     = require('child_process'),
	should = require('should'),
	service;

describe('Google Reverse Geocoding Service', function () {
	this.slow(5000);

	after('terminate child process', function () {
		service.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(service = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 5 seconds', function (done) {
			this.timeout(5000);

			service.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			service.send({
				type: 'ready',
				data: {
					options: {
						key: 'AIzaSyBCLsiw67avfWlSZ63ncN8d81dRk34nh_g',
						geocoding_type: 'Reverse'
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the latitude and longitude coordinates and send back a valid address', function (done) {
			this.timeout(3000);

			service.on('message', function (message) {
				if (message.type === 'result') {
					var data = JSON.parse(message.data);

					console.log(data);
					should.ok(data.address, 'Latitude data invalid.');
					done();
				}
			});

			service.send({
				type: 'data',
				data: {
					lat: 14.556978,
					lng: 121.034352
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});
});