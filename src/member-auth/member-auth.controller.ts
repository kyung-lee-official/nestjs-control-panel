import {
	Body,
	ClassSerializerInterceptor,
	Controller,
	Get,
	Patch,
	Post,
	Req,
	Res,
	UseGuards,
	UseInterceptors,
} from "@nestjs/common";
import { CreateMemberDto } from "../members/dto/create-member.dto";
import { MemberAuthService } from "./member-auth.service";
import { MemberAuthCredentialsDto } from "./dto/member-auth-credential.dto";
import { Member } from "../members/entities/member.entity";
import { GoogleOAuth20AuthGuard } from "./guards/google-oauth20.guard";
import { AllowPublicSignUpGuard } from "../member-server-settings/guards/allow-public-sign-up.guard";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AuthGuard } from "@nestjs/passport";
import { MemberVerifyEmailDto } from "./dto/member-verify-email.dto";
import { MemberForgetPasswordDto } from "./dto/member-forget-password.dto";
import { MemberResetPasswordDto } from "./dto/member-reset-password.dto";
import { CredentialData } from "qcloud-cos-sts";
import { MemberUpdateEmailRequestDto } from "./dto/member-update-email-request";
import {
	ApiBadRequestResponse,
	ApiBearerAuth,
	ApiBody,
	ApiForbiddenResponse,
	ApiOkResponse,
	ApiOperation,
	ApiUnauthorizedResponse,
} from "@nestjs/swagger";

@Controller("member-auth")
export class MemberAuthController {
	constructor(private memberAuthService: MemberAuthService) {}

	@ApiOperation({ summary: "Check if the server is seeded" })
	@ApiOkResponse({
		description: "Return true if the server is seeded",
		content: {
			"application/json": {
				examples: {
					Seeded: {
						value: {
							isSeeded: true,
						},
					},
					"Not Seeded": {
						value: {
							isSeeded: false,
						},
					},
				},
			},
		},
	})
	@Get("/isSeeded")
	isSeeded(): Promise<{ isSeeded: boolean }> {
		return this.memberAuthService.isSeeded();
	}

	@ApiOperation({
		description: `# Seed the server
Only available when the server is not seeded, the seed member will be the admin`,
	})
	@ApiBody({
		type: CreateMemberDto,
		description: "The member to be seeded",
		examples: {
			"Seed Member": {
				value: {
					email: "admin@example.com",
					nickname: "admin",
					password: "1234Abcd!",
				},
			},
		},
	})
	@ApiOkResponse({
		description: "Return the seeded member",
		content: {
			"application/json": {
				examples: {
					"Seed the server": {
						value: {
							email: "kyung.lee@qq.com",
							nickname: "Kyung",
							isVerified: false,
							isFrozen: false,
							memberRoles: [
								{
									id: 1,
									name: "admin",
									permissions: [
										"GET_MEMBER_SERVER_SETTING",
										"UPDATE_MEMBER_SERVER_SETTING",
										"CREATE_MEMBER",
										"UPDATE_MEMBER",
										"UPDATE_MEMBER_ME",
										"TRANSFER_MEMBER_ADMIN",
										"GET_MEMBERS",
										"GET_MEMBER_ME",
										"DELETE_MEMBER",
										"CREATE_MEMBER_ROLE",
										"UPDATE_MEMBER_ROLE",
										"GET_MEMBER_ROLES",
										"DELETE_MEMBER_ROLE",
										"CREATE_MEMBER_GROUP",
										"UPDATE_MEMBER_GROUP",
										"TRANSFER_MEMBER_GROUP_OWNER",
										"GET_MEMBER_GROUPS",
										"DELETE_MEMBER_GROUP",
										"GET_PERMISSIONS",
										"FIND_CHITUBOX_MANUAL_FEEDBACKS",
									],
									createdDate: "2023-12-28T10:05:06.274Z",
									updatedDate: "2023-12-28T10:05:06.274Z",
								},
								{
									id: 2,
									name: "default",
									permissions: ["GET_MEMBER_ME"],
									createdDate: "2023-12-28T10:05:06.279Z",
									updatedDate: "2023-12-28T10:05:06.279Z",
								},
							],
							ownedGroups: [
								{
									id: 1,
									name: "everyone",
									createdDate: "2023-12-28T10:05:06.280Z",
									updatedDate: "2023-12-28T10:05:06.280Z",
								},
							],
							memberGroups: [
								{
									id: 1,
									name: "everyone",
									createdDate: "2023-12-28T10:05:06.280Z",
									updatedDate: "2023-12-28T10:05:06.280Z",
								},
							],
							id: "cde0cd3b-cd65-4372-a60b-427c3348cf6d",
							createdDate: "2023-12-28T10:05:06.354Z",
							updatedDate: "2023-12-28T10:05:06.354Z",
						},
					},
				},
			},
		},
	})
	@ApiBadRequestResponse({
		description: "The server is already seeded",
		content: {
			"application/json": {
				examples: {
					"Server is already seeded": {
						value: {
							message: "Server already seeded",
							error: "Bad Request",
							statusCode: 400,
						},
					},
				},
			},
		},
	})
	@UseInterceptors(ClassSerializerInterceptor)
	@Post("/seed")
	seed(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
		return this.memberAuthService.seed(createMemberDto);
	}

	@ApiOperation({
		summary: `Sign up a member account`,
	})
	@ApiBody({
		type: CreateMemberDto,
		description: "The member to be signed up",
		examples: {
			"Sign Up Member": {
				value: {
					email: "member@example.com",
					nickname: "member",
					password: "1234Abcd!",
				},
			},
		},
	})
	@ApiOkResponse({
		description: "Return the signed up member",
		content: {
			"application/json": {
				examples: {
					"Sign up a member account": {
						value: {
							email: "member@example.com",
							nickname: "member",
							isVerified: false,
							isFrozen: false,
							memberRoles: [
								{
									id: 2,
									name: "default",
									permissions: ["GET_MEMBER_ME"],
									createdDate: "2023-12-25T07:05:19.299Z",
									updatedDate: "2023-12-25T07:05:19.299Z",
								},
							],
							memberGroups: [
								{
									id: 1,
									name: "everyone",
									createdDate: "2023-12-25T07:05:19.302Z",
									updatedDate: "2023-12-25T07:05:19.375Z",
								},
							],
							id: "e20788d7-f623-4c2c-af27-509b0dbe66a9",
							createdDate: "2023-12-28T07:49:36.512Z",
							updatedDate: "2023-12-28T07:49:36.512Z",
						},
					},
				},
			},
		},
	})
	@ApiForbiddenResponse({
		description: "Check if server settings allow public sign up",
	})
	@UseInterceptors(ClassSerializerInterceptor)
	@UseGuards(AllowPublicSignUpGuard)
	@Post("/signup")
	signUp(@Body() createMemberDto: CreateMemberDto): Promise<Member> {
		return this.memberAuthService.signUp(createMemberDto);
	}

	@ApiOperation({
		description: `# Sign in a member account
Return the accessToken`,
	})
	@ApiBody({
		description: "The member to be signed in",
		examples: {
			"Sign In Member": {
				value: {
					email: "member@example.com",
					password: "1234Abcd!",
				},
			},
		},
	})
	@ApiOkResponse({
		description: "Return the accessToken",
		content: {
			"application/json": {
				examples: {
					"Sign in a member account": {
						value: {
							accessToken:
								"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Im1lbWJlckBleGFtcGxlLmNvbSIsImlhdCI6MTcwMzc1NDQ3NywiZXhwIjoxNzAzNzY1Mjc3fQ.v5o3sbNf8hag9SLRCvPW9X8IonX5UeQYM9ms7fNwQiY",
						},
					},
				},
			},
		},
	})
	@Post("/signin")
	signIn(
		@Body() authCredentialsDto: MemberAuthCredentialsDto
	): Promise<{ accessToken: string }> {
		return this.memberAuthService.signIn(authCredentialsDto);
	}

	@ApiOperation({
		summary: "Check if the member is signed in",
	})
	@ApiOkResponse({
		description: "Return true if the member is signed in",
		content: {
			"application/json": {
				examples: {
					"Member is signed in": {
						value: {
							isSignedIn: true,
						},
					},
				},
			},
		},
	})
	@ApiUnauthorizedResponse({
		description: "Member is not signed in",
		content: {
			"application/json": {
				examples: {
					"Member is not signed in": {
						value: {
							message: "Unauthorized",
							statusCode: 401,
						},
					},
				},
			},
		},
	})
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("isSignedIn")
	isSignedIn(): Promise<{ isSignedIn: boolean }> {
		return this.memberAuthService.isSignedIn();
	}

	@ApiOperation({
		description: `# Refresh the accessToken
Return the new accessToken

Note: The old accessToken will not be invalid after refreshing`,
	})
	@ApiOkResponse({
		description: "Return the new accessToken",
		content: {
			"application/json": {
				examples: {
					"Refresh the accessToken": {
						value: {
							accessToken:
								"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6Imt5dW5nLmxlZUBxcS5jb20iLCJpYXQiOjE3MDM3NTkzODcsImV4cCI6MTcwMzc3MDE4N30.VoI_5t6lBm_56L7RP7DESpfQocPv49DpPJc766MhX3M",
						},
					},
				},
			},
		},
	})
	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Get("/refreshAccessToken")
	refreshAccessToken(@Req() req: any): Promise<{ accessToken: string }> {
		return this.memberAuthService.refreshAccessToken(req);
	}

	@ApiOperation({
		description: `# Sign in with Google
This is not a RESTful API, it should be called by the browser directly.

A Google OAuth2 popup will be opened, once authorized, the browser will be redirected to /member-auth/google/redirect`,
	})
	@Get("/google")
	@UseGuards(GoogleOAuth20AuthGuard)
	googleAuth(@Req() req: any) {}

	@ApiOperation({
		description: `# Google OAuth2 redirect
This is not a RESTful API, it should be called by the browser directly.`,
	})
	@ApiForbiddenResponse({
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
	})
	@Get("/google/redirect")
	@UseGuards(GoogleOAuth20AuthGuard)
	async googleAuthRedirect(@Req() req: any, @Res() res: any) {
		const googleOauth2Info = await this.memberAuthService.googleSignIn(req);
		console.log(googleOauth2Info);
		return {
			message: "User information from google",
			user: req.user,
		};
		// if (googleOauth2Info.isNewMember) {
		// 	if (googleOauth2Info.isSeedMember) {
		// 		return res.redirect(
		// 			`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewMember=true&isSeedMember=true`
		// 		);
		// 	} else {
		// 		return res.redirect(
		// 			`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewMember=true&isSeedMember=false`
		// 		);
		// 	}
		// } else {
		// 	return res.redirect(
		// 		`http://localhost:3000/signin/googleOauth2Redirect?accessToken=${googleOauth2Info.accessToken}&isNewMember=false&isSeedMember=false`
		// 	);
		// }
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Post("/sendVerificationEmail")
	sendVerificationEmail(@Req() req: any): Promise<void> {
		const member = req.user;
		const email = member.email;
		return this.memberAuthService.sendVerificationEmail(email);
	}

	/**
	 * For member-auth.http testing only, should be commented out in production
	 */
	// @Post("/testSendInitialPasswordEmail")
	// testSendInitialPasswordEmail(@Body() emailObj: any): Promise<void> {
	// 	return this.memberAuthService.sendInitialPasswordEmail(
	// 		emailObj.email,
	// 		"123456"
	// 	);
	// }

	@Post("/verifyEmail")
	verifyEmail(
		@Body() verifyEmailDto: MemberVerifyEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.memberAuthService.verifyEmail(verifyEmailDto);
	}

	@ApiBearerAuth()
	@UseGuards(JwtAuthGuard)
	@Patch("/update-email-request")
	sendUpdateEmailVerificationRequest(
		@Req() req: any,
		@Body() updateEmailRequestDto: MemberUpdateEmailRequestDto
	): Promise<{ isSent: boolean }> {
		const member = req.user;
		const email = member.email;
		return this.memberAuthService.sendUpdateEmailVerificationRequest(
			email,
			updateEmailRequestDto
		);
	}

	@Patch("/verifyNewEmail")
	veryfyNewEmail(
		@Body() verifyEmailDto: MemberVerifyEmailDto
	): Promise<{ isVerified: boolean }> {
		return this.memberAuthService.verifyNewEmail(verifyEmailDto);
	}

	@Post("/forgetPassword")
	forgetPassword(
		@Body() forgetPasswordDto: MemberForgetPasswordDto
	): Promise<void> {
		return this.memberAuthService.forgetPassword(forgetPasswordDto);
	}

	@Post("/resetPassword")
	resetPassword(
		@Body() resetPasswordDto: MemberResetPasswordDto
	): Promise<{ isReset: boolean }> {
		return this.memberAuthService.resetPassword(resetPasswordDto);
	}

	@Get("tencentCosTempCredential")
	async getTemporaryCredential(): Promise<CredentialData> {
		return this.memberAuthService.getTemporaryCredential();
	}
}
