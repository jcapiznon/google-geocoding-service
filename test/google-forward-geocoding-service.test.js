'use strict';

var cp       = require('child_process'),
	should   = require('should'),
	isNumber = require('lodash.isnumber'),
	service;

describe('Google Forward Geocoding Service', function () {
	this.slow(8000);

	after('terminate child process', function () {
		service.kill('SIGKILL');
	});

	describe('#spawn', function () {
		it('should spawn a child process', function () {
			should.ok(service = cp.fork(process.cwd()), 'Child process not spawned.');
		});
	});

	describe('#handShake', function () {
		it('should notify the parent process when ready within 8 seconds', function (done) {
			this.timeout(8000);

			service.on('message', function (message) {
				if (message.type === 'ready')
					done();
			});

			service.send({
				type: 'ready',
				data: {
					options: {
						key: 'AIzaSyBCLsiw67avfWlSZ63ncN8d81dRk34nh_g',
						geocoding_type: 'Forward'
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the address and send back the valid latitude and longitude coordinates', function (done) {
			this.timeout(5000);

			service.on('message', function (message) {
				if (message.type === 'result') {
					var data = JSON.parse(message.data);

					should.ok(isNumber(data.lat), 'Latitude data invalid.');
					should.ok(isNumber(data.lng), 'Longitude data invalid.');
					done();
				}
			});

			service.send({
				type: 'data',
				data: {
					address: '121, Curtain Road, EC2A 3AD, London UK'
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});
});