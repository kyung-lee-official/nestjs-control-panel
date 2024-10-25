import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { SignUpDto } from "./dto/signup.dto";
import { SignInDto } from "./dto/signin.dto";
import { JwtService } from "@nestjs/jwt";
import { PrismaService } from "src/prisma/prisma.service";
import bcrypt from "bcrypt";
import { EmailService } from "../email/email.service";
import axios from "axios";
import { generatePassword } from "src/utils/algorithms";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { CredentialData, getCredential } from "qcloud-cos-sts";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Injectable()
export class AuthenticationService {
	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService,
		private readonly emailService: EmailService
	) {}

	async signUp(signUpDto: SignUpDto) {
		const { email, nickname, password } = signUpDto;

		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const member = this.prismaService.member.create({
			data: {
				email,
				password: hashedPassword,
				nickname,
				isVerified: false,
				isFrozen: false,
				memberRoles: {
					connect: [{ id: "default" }],
				},
			},
			include: {
				memberRoles: true,
			},
		});
		await this.emailService.sendVerificationEmail(email);
		return member;
	}

	async verifyEmail(verifyEmailDto: VerifyEmailDto) {
		const { verificationToken } = verifyEmailDto;
		let payload: any;
		try {
			payload = this.jwtService.verify(verificationToken, {
				secret: process.env.SMTP_JWT_SECRET,
			});
		} catch (error) {
			if (error instanceof Error) {
				throw new UnauthorizedException(error.message);
			} else {
				throw new UnauthorizedException("Unknown error");
			}
		}
		const member = await this.prismaService.member.findUnique({
			where: {
				email: payload.email,
			},
		});
		if (!member) {
			throw new BadRequestException("Member not found");
		}
		await this.prismaService.member.update({
			where: {
				email: payload.email,
			},
			data: {
				isVerified: true,
			},
		});
		return { isVerified: true };
	}

	async signIn(signInDto: SignInDto) {
		const { email, password } = signInDto;
		const member = await this.prismaService.member.findUnique({
			where: {
				email: email,
			},
		});
		if (member && (await bcrypt.compare(password, member.password))) {
			const payload = { email };
			const jwt = this.jwtService.sign(payload);
			return { jwt };
		} else {
			throw new UnauthorizedException(
				"Please check your sign in credentials"
			);
		}
	}

	async isSignedIn() {
		/* JwtAuthGuard already validated the member */
		return { isSignedIn: true };
	}

	async refreshJwt(req: any) {
		const { email } = req.jwtPayload;
		const payload = { email };
		const jwt: string = this.jwtService.sign(payload);
		return { jwt };
	}

	async resetPassword(
		resetPasswordDto: ResetPasswordDto
	): Promise<{ isReset: boolean }> {
		const { password, resetPasswordToken } = resetPasswordDto;
		let payload;
		try {
			payload = this.jwtService.verify(resetPasswordToken, {
				secret: process.env.SMTP_JWT_SECRET,
			});
		} catch (error) {
			throw new BadRequestException("Invalid token");
		}
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const member = await this.prismaService.member.update({
			where: {
				email: payload.email,
			},
			data: {
				password: hashedPassword,
			},
		});
		return { isReset: true };
	}

	async googleSignIn(req: any): Promise<any> {
		/* Get the code from query string */
		const url = `https://oauth2.googleapis.com/token`;
		const { code } = req.query;
		const values = {
			code,
			client_id: process.env.GOOGLE_OAUTH20_CLIENT_ID,
			client_secret: process.env.GOOGLE_OAUTH20_SECRET,
			redirect_uri: process.env.GOOGLE_OAUTH20_REDIRECT_URI,
			grant_type: "authorization_code",
		};

		/* Get the id and access token with the code */
		let tokenRes: any;
		try {
			tokenRes = await axios.post(url, null, {
				headers: {
					"Content-Type": "application/x-www-form-urlencoded",
				},
				params: values,
			});
		} catch (error) {
			console.error(error, "Failed to get Google OAuth2 token.");
			if (error instanceof Error) {
				throw new Error(error.message);
			} else {
				throw new Error("Unknown error");
			}
		}

		/* Decode id_token to get google user info */
		const { id_token, access_token: googleAccessToken } = tokenRes.data;
		const googleUser = this.jwtService.decode(id_token) as any;
		const { email_verified, picture } = googleUser;

		if (!googleUser.email) {
			throw new NotFoundException("Google user not found");
		} else {
			const memberCount = await this.prismaService.member.count();
			if (memberCount > 0) {
				/* Server already seeded */
				const serverSettings =
					await this.prismaService.memberServerSetting.findMany();
				const isGoogleSignInAllowed =
					serverSettings[0].allowGoogleSignIn;
				if (!isGoogleSignInAllowed) {
					throw new ForbiddenException(
						"Google sign in is not allowed"
					);
				}
				const email = googleUser.email.toLowerCase();
				const isMemberExists =
					await this.prismaService.member.findUnique({
						where: { email: email },
					});
				if (!isMemberExists) {
					const password = generatePassword();
					const salt = await bcrypt.genSalt();
					const hashedPassword = await bcrypt.hash(password, salt);
					const member = this.prismaService.member.create({
						data: {
							email,
							password: hashedPassword,
							nickname: googleUser.name,
							isVerified: true,
							memberRoles: {
								connect: [{ id: "default", name: "default" }],
							},
						},
					});
					const payload = { email: email };
					const accessToken: string = this.jwtService.sign(payload);
					this.emailService.sendInitialPasswordEmail(email, password);
					return {
						isSeedMember: false,
						isNewMember: true,
						accessToken,
						googleAccessToken,
					};
				} else {
					const payload = { email: email };
					const accessToken: string = this.jwtService.sign(payload);
					return {
						isSeedMember: false,
						isNewMember: false,
						accessToken,
						googleAccessToken,
					};
				}
			} else {
				/* Server not seeded */
				const serverSettings =
					await this.prismaService.memberServerSetting.create({
						data: {
							allowPublicSignUp: false,
							allowGoogleSignIn: false,
						},
					});
				const email = googleUser.email.toLowerCase();
				const password = generatePassword();
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(password, salt);
				const member = await this.prismaService.member.create({
					data: {
						email,
						password: hashedPassword,
						nickname: googleUser.name,
						isVerified: true,
						memberRoles: {
							create: [
								{
									id: "admin",
									name: "Admin",
								},
							],
						},
					},
				});
				const payload = { email: email };
				const accessToken: string = this.jwtService.sign(payload);
				this.emailService.sendInitialPasswordEmail(email, password);
				return {
					isSeedMember: true,
					isNewMember: true,
					accessToken,
					googleAccessToken,
				};
			}
		}
	}

	async getTencentCosTempCredential(): Promise<CredentialData> {
		const config = {
			secretId: process.env.SECRET_ID!,
			secretKey: process.env.SECRET_KEY!,
			proxy: "",
			host: "sts.tencentcloudapi.com",
			durationSeconds: 120,
			bucket: process.env.BUCKET!,
			region: process.env.REGION,
			allowPrefix: "*",
		};
		const shortBucketName = config.bucket.split("-")[0];
		const appId = config.bucket.split("-")[1];
		const policy = {
			version: "2.0",
			statement: [
				{
					action: [
						/* 列出对象 */
						"name/cos:GetBucket",
						/* 简单上传 */
						"name/cos:PutObject",
						/* 分片上传 */
						"name/cos:InitiateMultipartUpload",
						"name/cos:ListMultipartUploads",
						"name/cos:ListParts",
						"name/cos:UploadPart",
						"name/cos:CompleteMultipartUpload",
						/* 下载 */
						"name/cos:GetObject",
						/* 删除 */
						"name/cos:DeleteObject",
					],
					effect: "allow",
					principal: { qcs: ["*"] },
					resource: [
						`qcs::cos:${config.region}:uid/${appId}:prefix//${appId}/${shortBucketName}/app/${config.allowPrefix}`,
					],
				},
			],
		};
		try {
			const credentialData = await getCredential({
				secretId: config.secretId,
				secretKey: config.secretKey,
				proxy: config.proxy,
				durationSeconds: config.durationSeconds,
				policy: policy,
			});
			return credentialData;
		} catch (error) {
			throw new InternalServerErrorException(error);
		}
	}
}
