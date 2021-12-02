function errorHandle(err, req, res, next) {
	if (err.name === "UnauthorizedError") {
		return res.status(401).json({ "error-message": err.message });
	}
	if (err.name === "ValidationError") {
		return res.status(401).json(err);
	}
	return res.status(500).json(err);
}

module.exports = errorHandle;
