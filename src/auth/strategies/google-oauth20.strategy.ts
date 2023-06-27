import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";

@Injectable()
export class GoogleOAuth20Strategy extends PassportStrategy(
	Strategy,
	"google"
) {
	constructor() {
		super({
			clientID: process.env.GOOGLE_OAUTH20_CLIENT_ID,
			clientSecret: process.env.GOOGLE_OAUTH20_SECRET,
			callbackURL: `${process.env.LOCAL_HOST}/auth/google/redirect`,
			scope: ["email", "profile"],
		});
	}

	async validate(
		accessToken: string,
		refreshToken: string,
		profile: Profile,
		done: VerifyCallback
	): Promise<any> {
		const { name, emails, photos } = profile;
		const user = {
			email: emails[0].value,
			givenName: name.givenName,
			familyName: name.familyName,
			picture: photos[0].value,
			accessToken,
		};
		return user;
	}
}
