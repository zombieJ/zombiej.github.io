$(document).ready(function() {
	$(document).scroll(function() {
		var _top = $(window).scrollTop() / 2;
		var _width = $(window).width();
		var _dt = (_width - 600) / 4;
		_dt = _dt < 0 ? 0 : _dt;
		_top = -_dt - _top;

		var img = $(".navbar-header .nav-cntr img");

		var _mh = img.height();
		var _nh = $(".navbar-header .nav-cntr").height();
		var _t = _mh - _nh;

		if(_t < -_top) _top = -_t;

		img.css("margin-top", _top);
	}).scroll();
	$(window).resize(function() {
		$(document).scroll();
	});
});