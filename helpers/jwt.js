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
			// { url: /\/api\/v1\/orders(.*)/, method: ["GET", "OPTIONS"] },
			`${api}/customers/login`,
			`${api}/customers/register`,
			`${api}/employees/login`,
			// `${api}/employees/register`,
		],
	});
}

async function isRevoked(req, payload, done) {
	req.locals = {payload: payload}
	if (payload.isEmployee) {
		done();
	}
	done(null, true);
}

module.exports = authJwt;
