import UsersDAO from "../users/users.dao.js";
import UsersDTO from "../users/users.dto.js";

import passport from "passport";
import GitHubStrategy from "passport-github2";
import { Strategy as JtwStrategy } from "passport-jwt";
import { ENV } from "../config/config.js";

const { SECRET_COOKIE } = ENV;
const { CLIENT_ID, CLIENT_SECRET, CALLBACK_URL } = ENV.GITHUB;

passport.serializeUser((user, done) => {
	done(null, user._id);
});

passport.deserializeUser((user, done) => {
	done(null, user);
});

passport.use(
	"jwt",
	new JtwStrategy(
		{
			jwtFromRequest: req => {
				let token = null;
				if (req && req.signedCookies) {
					token = req.signedCookies.jwt;
				}
				return token;
			},
			secretOrKey: SECRET_COOKIE,
		},
		async function (jwtPayload, done) {
			const user = await UsersDAO.getById(jwtPayload.id);
			if (user) {
				return done(null, user);
			} else {
				return done(null, { role: "USER", cart: null, username: null });
			}
		}
	)
);

passport.use(
	"github",
	new GitHubStrategy(
		{
			clientID: CLIENT_ID,
			clientSecret: CLIENT_SECRET,
			callbackURL: CALLBACK_URL,
			scope: "user:email",
		},
		async (accessToken, refreshToken, profile, done) => {
			try {
				const user = await UsersDAO.getByEmailUserGithub(
					profile.emails[0].value
				);
				if (user) {
					done(null, user);
				} else {
					done(null, await UsersDTO.fromGithub(await profile));
				}
			} catch (error) {
				console.error("Error al loguear con github:", error);
				done(error, null);
			}
		}
	)
);

export default passport;
