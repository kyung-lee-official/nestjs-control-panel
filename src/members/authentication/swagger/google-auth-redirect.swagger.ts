import {
	ApiOperationOptions,
	ApiQueryOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";

export const googleAuthRedirectOperationOptions: ApiOperationOptions = {
	summary: "Google OAuth2 redirect",
	description: `# Google OAuth2 Redirect
This API should not be called directly, it will be called by Google Consent Screen automatically after the user authorized the app.

Google Consent Screen will redirect to this API with some query parameters, one of them is the authorization code, which will be used to get the access token from Google OAuth2 server.
`,
	externalDocs: {
		description: "Using OAuth 2.0 for Web Server Applications",
		url: "https://developers.google.com/identity/protocols/oauth2/web-server",
	},
};

export const googleAuthRedirectPromptOptions: ApiQueryOptions = {
	name: "prompt",
	description: "The prompt that the user granted",
	required: true,
	example: "consent",
};

export const googleAuthRedirectAuthuserOptions: ApiQueryOptions = {
	name: "authuser",
	description: "The user account that the user granted",
	required: true,
};

export const googleAuthRedirectScopeOptions: ApiQueryOptions = {
	name: "scope",
	description: "The scopes that the user granted",
	required: true,
};

export const googleAuthRedirectCodeOptions: ApiQueryOptions = {
	name: "code",
	description: "The authorization code",
	required: true,
};

export const googleAuthRedirectOkResponseOptions: ApiResponseOptions = {
	description:
		"Note that this API returns a **redirect response** so the browser will be redirected to the frontend with information in the query parameters, it doesn't return a JSON response like the example below",
	content: {
		"application/json": {
			examples: {
				"Google sign in is allowed": {
					value: {
						isSeedMember: false,
						isNewMember: false,
						accessToken:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzA0ODcxODU2LCJleHAiOjE3MDQ4ODI2NTZ9.M2dUmrOBMtk-26zSg9484mVRNYCZmXEI417rmVUcko8",
						googleAccessToken:
							"ya29.a0AfB_byC2avNbte4iUFSZoywkcnu6MSyp5swQwjfQwYRDWCrSb2Dq6kmOfcofuMuKFx2-EEBpRAIuWjW-hW2MVO1GuxBiuClfW9F43gy8Ql83sM6rSfS5PCSL8mwGFSOLRa6iirnNkEeowvp9Mds9sp0h_nZTi5MVwEQfaCgYKAbESARESFQHGX2MiHzK9w_0tHYVSFCPodd5Q8A0171",
					},
				},
			},
		},
	},
};

export const googleAuthredirectForbiddenOptions: ApiResponseOptions = {
	description: "Check if Google sign in is allowed in server settings",
	content: {
		"application/json": {
			examples: {
				"Google sign in is not allowed": {
					value: {
						message: "Google sign in is not allowed",
						error: "Forbidden",
						statusCode: 403,
					},
				},
			},
		},
	},
};
