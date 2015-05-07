exports.loadFile = function() {
	var idx = Math.floor(Math.random() * fortuneCookies.length);
	return fortuneCookies[idx];
};
