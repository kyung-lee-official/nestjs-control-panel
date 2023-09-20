import {
	BadRequestException,
	ForbiddenException,
	Inject,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "../users/dto/create-user.dto";
import { User } from "../users/entities/user.entity";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import bcrypt from "bcrypt";
import { JwtPayload } from "./jwt-payload.interface";
import { Role } from "../roles/entities/role.entity";
import { Permissions } from "../permissions/permissions.enum";
import { Group } from "../groups/entities/group.entity";
import { ServerSetting } from "../server-settings/entities/server-setting.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { generatePassword } from "../utils/algorithms";
import { ForgetPasswordDto } from "./dto/forget-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { CredentialData, getCredential } from "qcloud-cos-sts";

@Injectable()
export class AuthService {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>,
		@InjectRepository(Role)
		private rolesRepository: Repository<Role>,
		@InjectRepository(Group)
		private groupsRepository: Repository<Group>,
		@InjectRepository(ServerSetting)
		private settingsRepository: Repository<ServerSetting>,
		private jwtService: JwtService,
		private mailerService: MailerService
	) {}

	async isSeeded(): Promise<{ isSeeded: boolean }> {
		const userQb = this.usersRepository.createQueryBuilder("user");
		userQb.limit(3);
		const users = await userQb.getMany();
		if (users.length > 0) {
			return { isSeeded: true };
		} else {
			return { isSeeded: false };
		}
	}

	async seed(createUserDto: CreateUserDto): Promise<User> {
		const userQb = this.usersRepository.createQueryBuilder("user");
		userQb.limit(3);
		const users = await userQb.getMany();
		if (users.length > 0) {
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
		defaultRole.permissions = [Permissions.GET_ME];
		defaultRole = await this.rolesRepository.save(defaultRole);
		const everyoneGroup = this.groupsRepository.create({
			name: "everyone",
		});
		await this.groupsRepository.save(everyoneGroup);
		let { email, password, nickname } = createUserDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const dbEveryoneGroup = await this.groupsRepository.findOne({
			where: { name: "everyone" },
		});
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			roles: [adminRole],
			groups: [dbEveryoneGroup],
			ownedGroups: [dbEveryoneGroup],
		});
		await this.usersRepository.save(user);
		await this.sendVerificationEmail(email);
		return user;
	}

	async signUp(createUserDto: CreateUserDto): Promise<User> {
		let { email, password, nickname } = createUserDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const dbdefaultRole = await this.rolesRepository.findOne({
			where: { name: "default" },
		});
		const dbEveryoneGroup = await this.groupsRepository.findOne({
			where: { name: "everyone" },
		});
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			roles: [dbdefaultRole],
			groups: [dbEveryoneGroup],
		});
		await this.usersRepository.save(user);
		await this.sendVerificationEmail(email);
		return user;
	}

	async signIn(
		authCredentialsDto: AuthCredentialsDto
	): Promise<{ accessToken: string }> {
		const { email, password } = authCredentialsDto;
		const user = await this.usersRepository.findOne({
			where: {
				email: email,
			},
		});
		if (user && (await bcrypt.compare(password, user.password))) {
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
		/* JwtAuthGuard already validated the user */
		return { isSignedIn: true };
	}

	async refreshAccessToken(req: any): Promise<{ accessToken: string }> {
		const { email } = req.user;
		const payload: JwtPayload = { email };
		const accessToken: string = this.jwtService.sign(payload);
		return { accessToken };
	}

	async googleSignIn(req: any): Promise<{
		isSeedUser: boolean;
		isNewUser: boolean;
		accessToken: string;
		googleAccessToken: string;
	}> {
		if (!req.user) {
			throw new InternalServerErrorException("User not found");
		} else {
			const userQb = this.usersRepository.createQueryBuilder("user");
			userQb.limit(3);
			const users = await userQb.getMany();
			if (users.length > 0) {
				/* Server already seeded */
				const serverSettings = await this.settingsRepository.find();
				const isGoogleSignInAllowed =
					serverSettings[0].allowGoogleSignIn;
				if (!isGoogleSignInAllowed) {
					throw new ForbiddenException(
						"Google sign in is not allowed"
					);
				}
				const googleAccessToken = req.user.accessToken;
				const email = req.user.email.toLowerCase();
				const isUserExists = await this.usersRepository.findOne({
					where: { email: email },
				});
				if (!isUserExists) {
					const password = generatePassword();
					const salt = await bcrypt.genSalt();
					const hashedPassword = await bcrypt.hash(password, salt);
					const dbEveryoneGroup = await this.groupsRepository.findOne(
						{
							where: { name: "everyone" },
						}
					);
					const dbdefaultRole = await this.rolesRepository.findOne({
						where: { name: "default" },
					});
					const user = this.usersRepository.create({
						email: email,
						password: hashedPassword,
						nickname:
							req.user.givenName + " " + req.user.familyName,
						roles: [dbdefaultRole],
						groups: [dbEveryoneGroup],
						isVerified: true,
					});
					await this.usersRepository.save(user);
					const payload: JwtPayload = { email: email };
					const accessToken: string = this.jwtService.sign(payload);
					this.sendInitialPasswordEmail(email, password);
					return {
						isSeedUser: false,
						isNewUser: true,
						accessToken,
						googleAccessToken,
					};
				} else {
					const payload: JwtPayload = { email: email };
					const accessToken: string = this.jwtService.sign(payload);
					return {
						isSeedUser: false,
						isNewUser: false,
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
				defaultRole.permissions = [Permissions.GET_ME];
				await this.rolesRepository.save(defaultRole);
				const everyoneGroup = this.groupsRepository.create({
					name: "everyone",
				});
				await this.groupsRepository.save(everyoneGroup);
				const googleAccessToken = req.user.accessToken;
				const email = req.user.email.toLowerCase();
				const password = generatePassword();
				const salt = await bcrypt.genSalt();
				const hashedPassword = await bcrypt.hash(password, salt);
				const dbEveryoneGroup = await this.groupsRepository.findOne({
					where: { name: "everyone" },
				});
				const user = this.usersRepository.create({
					email,
					password: hashedPassword,
					nickname: req.user.givenName + " " + req.user.familyName,
					roles: [adminRole],
					groups: [dbEveryoneGroup],
					ownedGroups: [dbEveryoneGroup],
					isVerified: true,
				});
				await this.usersRepository.save(user);
				const payload: JwtPayload = { email: email };
				const accessToken: string = this.jwtService.sign(payload);
				this.sendInitialPasswordEmail(email, password);
				return {
					isSeedUser: true,
					isNewUser: true,
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

	async verifyEmail(verifyEmailDto: VerifyEmailDto) {
		const { verificationToken } = verifyEmailDto;
		const payload: JwtPayload = this.jwtService.verify(verificationToken, {
			secret: process.env.SMTP_JWT_SECRET,
		});
		const user = await this.usersRepository.findOne({
			where: {
				email: payload.email,
			},
		});
		if (!user) {
			throw new BadRequestException("User not found");
		}
		user.isVerified = true;
		await this.usersRepository.save(user);
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

	async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
		const { email } = forgetPasswordDto;
		const user = await this.usersRepository.findOne({
			where: { email: email },
		});
		if (!user) {
			throw new NotFoundException("User not found");
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
		resetPasswordDto: ResetPasswordDto
	): Promise<{ isReset: boolean }> {
		const { password, resetPasswordToken } = resetPasswordDto;
		let payload: JwtPayload;
		let user: User;
		try {
			payload = this.jwtService.verify(resetPasswordToken, {
				secret: process.env.SMTP_JWT_SECRET,
			});
			user = await this.usersRepository.findOne({
				where: {
					email: payload.email,
				},
			});
		} catch (error) {
			throw new BadRequestException("Invalid token");
		}
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		user.password = hashedPassword;
		await this.usersRepository.save(user);
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
