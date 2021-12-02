const expressJwt = require("express-jwt");

function authJwt() {
	const secret = process.env.SECRET;
	const api = process.env.API_URL;
	return expressJwt({
		secret,
		algorithms: ["HS256"],
		isRevoked: isRevoked,
	}).unless({
		path: [
			{ url: /\/api\/v1\/products(.*)/, method: ["GET", "OPTIONS"] },
			{ url: /\/api\/v1\/categories(.*)/, method: ["GET", "OPTIONS"] },
			`${api}/customers/login`,
			`${api}/customers/register`,
			`${api}/employees/login`,
			`${api}/employees/login`,
		],
	});
}

async function isRevoked(req, payload, done) {
	if (payload.isCustomer) {
		done(null, true);
	}
	done();
}

module.exports = authJwt;
