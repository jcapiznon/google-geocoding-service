'use strict';

var cp     = require('child_process'),
	should = require('should'),
	service;

describe('Google Reverse Geocoding Service', function () {
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
						geocoding_type: 'Reverse',
						parse_address: true
					}
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});

	describe('#data', function () {
		it('should process the latitude and longitude coordinates and send back a valid address', function (done) {
			this.timeout(5000);
			var requestId = (new Date()).getTime().toString();

			service.on('message', function (message) {
				if (message.type === 'result') {
					var data = JSON.parse(message.data);
					console.log(data);

					should.ok(data.address, 'Address is missing.');
					should.ok(data.address.full_address, 'Full Address is missing.');
					should.ok(data.address.street_address, 'Street Address is missing.');
					should.ok(data.address.city, 'City is missing.');
					should.ok(data.address.state, 'State is missing.');
					should.ok(data.address.postal_code, 'Postal Code is missing.');
					should.ok(data.address.country, 'Country is missing.');
					should.equal(message.requestId, requestId);
					done();
				}
			});

			service.send({
				type: 'data',
				requestId: requestId,
				data: {
					lat: -34.016494,
					lng: 151.258942
				}
			}, function (error) {
				should.ifError(error);
			});
		});
	});
});