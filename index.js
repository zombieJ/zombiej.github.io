var DEFAULT_START_IMAGE_VALUE = 0;

function toCode(str) {
	var sum = 0;
	for (var i = 0; i < str.length; i += 1) {
		sum += str.charCodeAt(i) * (i + 1);
	}
	return sum;
}

function findIndex(str) {
	var code = toCode(str);
	for (var i = 0; i < seatList.length; i += 1) {
		if (seatList[i].code === code) return i;
	}
	return -1;
}

window.onload = function () {
	var app = new Vue({
		el: '#app',
		data: {
			startClose: false,
			startValue: 100,
			startImgValue: DEFAULT_START_IMAGE_VALUE,
			username: '',
			usernameErr: false,
			userIndex: -1,
			seatValue: 0,
			seatLineCount: 2,
		},
		computed: {
			startImgWidth: function () {
				var bs = 0.5;
				return Math.pow(this.startImgValue, bs) / Math.pow(100, bs - 1);
			},
			startHeight: function () {
				var bs = 3;
				return Math.pow(this.startValue, bs) / Math.pow(100, bs - 1);
			},
		},
		created: function () {
			// 开场动画
			this.doInterval('startImgValue', 3, 20, function () {
				document.getElementById("username").focus();
			});

			// setTimeout(function () {
			// 	this.username = '123';
			// 	this.submit();
			// }.bind(this), 100);
		},
		methods: {
			doInterval: function(valeName, step, interval, callback) {
				var data = this;
				var id = setInterval(function () {
					data[valeName] += step;

					if (data[valeName] < 0) {
						data[valeName] = 0;
						clearInterval(id);
						if (callback) callback();
					} else if (data[valeName] > 100) {
						data[valeName] = 100;
						clearInterval(id);
						if (callback) callback();
					}
				}, interval);
			},

			submit: function() {
				this.userIndex = findIndex(this.username.trim());
				if (this.userIndex === -1) {
					this.usernameErr = true;
					document.getElementById("userSubmit").focus();
					return;
				}

				this.usernameErr = false;
				this.startClose = true;
				this.doInterval('startValue', -3, 20);
				setTimeout(this.showSeat, 200);
			},

			showSeat: function () {
				this.doInterval('seatValue', 3, 20);
			},

			getSeatLineList: function (n) {
				var index = n - 1;
				var lineSeatCount = seatList.length / this.seatLineCount;
				var lineSeatList = seatList.slice(index * lineSeatCount, n * lineSeatCount);
				var leftSeatList = lineSeatList.slice(0, lineSeatList.length / 2);
				var rightSeatList = lineSeatList.slice(lineSeatList.length / 2);
				var tableList = [];
				for (var i = 0; i < leftSeatList.length; i += 1) {
					tableList.push({
						left: leftSeatList[i],
						right: rightSeatList[i],
					});
				}
				return tableList;
			},

			restart: function () {
				this.startClose = false;
				this.startValue = 100;
				this.startImgValue = 100;
				this.seatValue = 0;

				setTimeout(function () {
					document.getElementById("username").focus();
				}, 100);
			},
		},
	});
};
