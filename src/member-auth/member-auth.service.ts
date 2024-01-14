import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { CreateMemberDto } from "../members/dto/create-member.dto";
import { Member } from "../members/entities/member.entity";
import { MemberAuthCredentialsDto } from "./dto/member-auth-credential.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { JwtPayload } from "./jwt-payload.interface";
import { MemberRole } from "../member-roles/entities/member-role.entity";
import { Permissions } from "../permissions/permissions.enum";
import { MemberGroup } from "../member-groups/entities/member-group.entity";
import { MemberServerSetting } from "../member-server-settings/entities/member-server-setting.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { MemberVerifyEmailDto } from "./dto/member-verify-email.dto";
import { generatePassword } from "../utils/algorithms";
import { MemberForgetPasswordDto } from "./dto/member-forget-password.dto";
import { MemberResetPasswordDto } from "./dto/member-reset-password.dto";
import { CredentialData, getCredential } from "qcloud-cos-sts";
import { MemberUpdateEmailRequestDto } from "./dto/member-update-email-request";
import axios from "axios";

@Injectable()
export class MemberAuthService {
	constructor(
		@InjectRepository(Member)
		private membersRepository: Repository<Member>,
		@InjectRepository(MemberRole)
		private rolesRepository: Repository<MemberRole>,
		@InjectRepository(MemberGroup)
		private groupsRepository: Repository<MemberGroup>,
		@InjectRepository(MemberServerSetting)
		private settingsRepository: Repository<MemberServerSetting>,
		private jwtService: JwtService,
		private mailerService: MailerService
	) {}

	async isSeeded(): Promise<{ isSeeded: boolean }> {
		const memberQb = this.membersRepository.createQueryBuilder("member");
		memberQb.limit(3);
		const members = await memberQb.getMany();
		if (members.length > 0) {
			return { isSeeded: true };
		} else {
			return { isSeeded: false };
		}
	}

	async seed(createMemberDto: CreateMemberDto): Promise<Member> {
		const memberQb = this.membersRepository.createQueryBuilder("member");
		memberQb.limit(3);
		const members = await memberQb.getMany();
		if (members.length > 0) {
			throw new BadRequestException("Server already seeded");
		}
		const serverSettings = this.settingsRepository.create({
			allowPublicSignUp: false,
			allowGoogleSignIn: false,
		});
		await this.settingsRepository.save(serverSettings);
		const adminRole = this.rolesRepository.create({ name: "admin" });
		adminRole.permissions =
			Object.values(Permissions); /* Full permissions */
		await this.rolesRepository.save(adminRole);
		let defaultRole = this.rolesRepository.create({ name: "default" });
		defaultRole.permissions = [Permissions.GET_MEMBER_ME];
		defaultRole = await this.rolesRepository.save(defaultRole);
		const everyoneGroup = this.groupsRepository.create({
			name: "everyone",
		});
		await this.groupsRepository.save(everyoneGroup);
		let { email, password, nickname } = createMemberDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const dbEveryoneGroup = await this.groupsRepository.findOne({
			where: { name: "everyone" },
		});
		const member = this.membersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			isVerified: false,
			isFrozen: false,
			memberRoles: [adminRole, defaultRole],
			memberGroups: [dbEveryoneGroup],
			ownedGroups: [dbEveryoneGroup],
		});
		await this.membersRepository.save(member);
		await this.sendVerificationEmail(email);
		return member;
	}

	async signUp(createMemberDto: CreateMemberDto): Promise<Member> {
		let { email, password, nickname } = createMemberDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const dbDefaultRole = await this.rolesRepository.findOne({
			where: { name: "default" },
		});
		const dbEveryoneGroup = await this.groupsRepository.findOne({
			where: { name: "everyone" },
		});
		const member = this.membersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			isVerified: false,
			isFrozen: false,
			memberRoles: [dbDefaultRole],
			memberGroups: [dbEveryoneGroup],
		});
		await this.membersRepository.save(member);
		await this.sendVerificationEmail(email);
		return member;
	}

	async signIn(
		memberAuthCredentialsDto: MemberAuthCredentialsDto
	): Promise<{ accessToken: string }> {
		const { email, password } = memberAuthCredentialsDto;
		const member = await this.membersRepository.findOne({
			where: {
				email: email,
			},
		});
		if (member && (await bcrypt.compare(password, member.password))) {
			const payload: JwtPayload = { email };
			const accessToken: string = this.jwtService.sign(payload);
			return { accessToken };
		} else {
			throw new UnauthorizedException(
				"Please check your sign in credentials"
			);
		}
	}

	async isSignedIn(): Promise<{ isSignedIn: boolean }> {
		/* JwtAuthGuard already validated the member */
		return { isSignedIn: true };
	}

	async refreshAccessToken(req: any): Promise<{ accessToken: string }> {
		const { email } = req.requester;
		const payload: JwtPayload = { email };
		const accessToken: string = this.jwtService.sign(payload);
		return { accessToken };
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
			throw new Error(error.message);
		}

		/* Decode id_token to get google user info */
		const { id_token, access_token: googleAccessToken } = tokenRes.data;
		const googleUser = this.jwtService.decode(id_token) as any;
		const { email_verified, picture } = googleUser;

		if (!googleUser.email) {
			throw new NotFoundException("Google user not found");
		} else {
			const memberQb =
				this.membersRepository.createQueryBuilder("member");
			memberQb.limit(3);
			const members = await memberQb.getMany();
			if (members.length > 0) {
				/* Server already seeded */
				const serverSettings = await this.settingsRepository.find();
				const isGoogleSignInAllowed =
					serverSettings[0].allowGoogleSignIn;
				if (!isGoogleSignInAllowed) {
					throw new ForbiddenException(
						"Google sign in is not allowed"
					);
				}
				const email = googleUser.email.toLowerCase();
				const isMemberExists = await this.membersRepository.findOne({
					where: { email: email },
				});
				if (!isMemberExists) {
					const password = generatePassword();
					const salt = await bcrypt.genSalt();
					const hashedPassword = await bcrypt.hash(password, salt);
					const dbEveryoneGroup = await this.groupsRepository.findOne(
						{
							where: { name: "everyone" },
						}
					);
					const dbDefaultRole = await this.rolesRepository.findOne({
						where: { name: "default" },
					});
					const member = this.membersRepository.create({
						email: email,
						password: hashedPassword,
						nickname: googleUser.name,
						memberRoles: [dbDefaultRole],
						memberGroups: [dbEveryoneGroup],
						isVerified: true,
					});
					await this.membersRepository.save(member);
					const payload: JwtPayload = { email: email };
					const accessToken: string = this.jwtService.sign(payload);
					this.sendInitialPasswordEmail(email, password);
					return {
						isSeedMember: false,
						isNewMember: true,
						accessToken,
						googleAccessToken,
					};
				} else {
					const payload: JwtPayload = { email: email };
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
				const serverSettings = this.settingsRepository.create({
					allowPublicSignUp: false,
					allowGoogleSignIn: false,
				});
				await this.settingsRepository.save(serverSettings);
				const adminRole = this.rolesRepository.create({
					name: "admin",
				});
				adminRole.permissions =
					Object.values(Permissions); /* Full permissions */
				await this.rolesRepository.save(adminRole);
				const defaultRole = this.rolesRepository.create({
					name: "default",
				});
				defaultRole.permissions = [Permissions.GET_MEMBER_ME];
				await this.rolesRepository.save(defaultRole);
				const everyoneGroup = this.groupsRepository.create({
					name: "everyone",
				});
				await this.groupsRepository.save(everyoneGroup);
				const email = googleUser.email.toLowerCase();
				const password = generatePassword();
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(password, salt);
				const dbEveryoneGroup = await this.groupsRepository.findOne({
					where: { name: "everyone" },
				});
				const member = this.membersRepository.create({
					email,
					password: hashedPassword,
					nickname: googleUser.name,
					memberRoles: [adminRole, defaultRole],
					memberGroups: [dbEveryoneGroup],
					ownedGroups: [dbEveryoneGroup],
					isVerified: true,
				});
				await this.membersRepository.save(member);
				const payload: JwtPayload = { email: email };
				const accessToken: string = this.jwtService.sign(payload);
				this.sendInitialPasswordEmail(email, password);
				return {
					isSeedMember: true,
					isNewMember: true,
					accessToken,
					googleAccessToken,
				};
			}
		}
	}

	async sendVerificationEmail(email: string) {
		const payload: JwtPayload = { email };
		const token: string = this.jwtService.sign(payload, {
			secret: process.env.SMTP_JWT_SECRET,
			expiresIn: "1d",
		});

		const textTemplate = (url: string) =>
			`Please verify your email by clicking on the following link ${url}`;
		const htmlTemplate = (url: string) => `
			<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
				<h1>Verify your email 📧</h1>
				<p>Please verify your email by clicking on the following link:</p>
				<a href="${url}">👉🏼 Click here</a>
			</div>
		`;

		try {
			await this.mailerService.sendMail({
				from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_USER}>` /* sender address */,
				to: email /* list of receivers, comma separated */,
				subject:
					"Please verify your email address 📧" /* subject line */,
				text: textTemplate(
					`${process.env.FRONTEND_HOST}/signup/emailVerification?token=${token}`
				) /* plain text body */,
				html: htmlTemplate(
					`${process.env.FRONTEND_HOST}/signup/emailVerification?token=${token}`
				) /* html body */,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send verification email"
			);
		}
	}

	async verifyEmail(verifyEmailDto: MemberVerifyEmailDto) {
		const { verificationToken } = verifyEmailDto;
		const payload: JwtPayload = this.jwtService.verify(verificationToken, {
			secret: process.env.SMTP_JWT_SECRET,
		});
		const member = await this.membersRepository.findOne({
			where: {
				email: payload.email,
			},
		});
		if (!member) {
			throw new BadRequestException("Member not found");
		}
		member.isVerified = true;
		await this.membersRepository.save(member);
		return { isVerified: true };
	}

	async sendUpdateEmailVerificationRequest(
		requesterEmail: string,
		updateEmailRequestDto: MemberUpdateEmailRequestDto
	) {
		const { newEmail } = updateEmailRequestDto;
		if (requesterEmail === newEmail) {
			throw new BadRequestException(
				"New email is the same as the old one"
			);
		}
		const isEmailExists = await this.membersRepository.findOne({
			where: { email: newEmail },
		});
		if (isEmailExists) {
			throw new BadRequestException("Email already exists");
		}

		const payload: JwtPayload = {
			email: requesterEmail,
			newEmail: newEmail,
		};
		const token: string = this.jwtService.sign(payload, {
			secret: process.env.SMTP_JWT_SECRET,
			expiresIn: "1d",
		});

		const textTemplate = (url: string) =>
			`Please verify your new email by clicking on the following link ${url}`;

		const htmlTemplate = (url: string) => `
			<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
				<h1>Verify your new email 📧</h1>
				<p>Please verify your new email by clicking on the following link:</p>
				<a href="${url}">👉🏼 Click here</a>
			</div>
		`;

		try {
			await this.mailerService.sendMail({
				from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_USER}>` /* sender address */,
				to: newEmail /* list of receivers, comma separated */,
				subject:
					"Please verify your new email address 📧" /* subject line */,
				text: textTemplate(
					`${process.env.FRONTEND_HOST}/member-auth/newEmailVerification?token=${token}`
				) /* plain text body */,
				html: htmlTemplate(
					`${process.env.FRONTEND_HOST}/member-auth/newEmailVerification?token=${token}`
				) /* html body */,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send verification email"
			);
		}

		return { isSent: true };
	}

	async verifyNewEmail(verifyEmailDto: MemberVerifyEmailDto) {
		const { verificationToken } = verifyEmailDto;
		const payload: JwtPayload = this.jwtService.verify(verificationToken, {
			secret: process.env.SMTP_JWT_SECRET,
		});
		const { email, newEmail } = payload;
		const member = await this.membersRepository.findOne({
			where: {
				email: email,
			},
		});
		if (!member) {
			throw new BadRequestException("Member not found");
		}
		member.email = newEmail;
		await this.membersRepository.save(member);
		return { isVerified: true };
	}

	async sendInitialPasswordEmail(email: string, password: string) {
		try {
			await this.mailerService.sendMail({
				from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_USER}>` /* sender address */,
				to: email /* list of receivers, comma separated */,
				subject: "Your initial password 🗝️" /* subject line */,
				/* plain text body */
				text: `Hi, this is your initial password: ${password}`,
				/* html body */
				html: `<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
					<h1>Hi, this is your initial password: 🗝️</h1>
					<p>${password}</p>
				</div>`,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send initial password email"
			);
		}
	}

	async forgetPassword(forgetPasswordDto: MemberForgetPasswordDto) {
		const { email } = forgetPasswordDto;
		const member = await this.membersRepository.findOne({
			where: { email: email },
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		this.sendForgetPasswordEmail(email);
		return;
	}

	async sendForgetPasswordEmail(email: string) {
		const payload: JwtPayload = { email };
		const token: string = this.jwtService.sign(payload, {
			secret: process.env.SMTP_JWT_SECRET,
			expiresIn: "10m",
		});

		const textTemplate = (url: string) =>
			`Please reset your password by clicking on the following link, the link remains valid for 10 minutes, if you did not request a password reset, please ignore this email: ${url}`;
		const htmlTemplate = (url: string) => `
			<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
				<h1>Reset your password 🗝️</h1>
				<p>Please reset your password by clicking on the following link, the link remains valid for 10 minutes, if you did not request a password reset, please ignore this email:</p>
				<a href="${url}">👉🏼 Click here</a>
			</div>
		`;

		try {
			await this.mailerService.sendMail({
				from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_USER}>` /* sender address */,
				to: email /* list of receivers, comma separated */,
				subject: "Reset your password 🗝️" /* subject line */,
				text: textTemplate(
					`${process.env.FRONTEND_HOST}/signin/resetPassword?token=${token}`
				) /* plain text body */,
				html: htmlTemplate(
					`${process.env.FRONTEND_HOST}/signin/resetPassword?token=${token}`
				) /* html body */,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send forget password email"
			);
		}
	}

	async resetPassword(
		resetPasswordDto: MemberResetPasswordDto
	): Promise<{ isReset: boolean }> {
		const { password, resetPasswordToken } = resetPasswordDto;
		let payload: JwtPayload;
		let member: Member;
		try {
			payload = this.jwtService.verify(resetPasswordToken, {
				secret: process.env.SMTP_JWT_SECRET,
			});
			member = await this.membersRepository.findOne({
				where: {
					email: payload.email,
				},
			});
		} catch (error) {
			throw new BadRequestException("Invalid token");
		}
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		member.password = hashedPassword;
		await this.membersRepository.save(member);
		return { isReset: true };
	}

	async getTemporaryCredential(): Promise<CredentialData> {
		const config = {
			secretId: process.env.SECRET_ID,
			secretKey: process.env.SECRET_KEY,
			proxy: "",
			host: "sts.tencentcloudapi.com",
			durationSeconds: 120,
			bucket: process.env.BUCKET,
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
