import {
	BadRequestException,
	Inject,
	Injectable,
	InternalServerErrorException,
	UnauthorizedException,
} from "@nestjs/common";
import { CreateUserDto } from "src/users/dto/create-user.dto";
import { User } from "src/users/entities/user.entity";
import { AuthCredentialsDto } from "./dto/auth-credential.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { JwtPayload } from "./jwt-payload.interface";
import { Role } from "src/roles/entities/role.entity";
import { Permissions } from "src/permissions/permissions.enum";
import { REQUEST } from "@nestjs/core";
import { Group } from "src/groups/entities/group.entity";
import { ServerSetting } from "src/server-settings/entities/server-setting.entity";
import { MailerService } from "@nestjs-modules/mailer";
import { VerifyEmailDto } from "./dto/verify-email.dto";

@Injectable()
export class AuthService {
	constructor(
		@Inject(REQUEST)
		private request: any,
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
		const serverSettings = this.settingsRepository.create({
			allowPublicSignUp: false,
			allowGoogleSignUp: false,
		});
		await this.settingsRepository.save(serverSettings);

		const userQb = this.usersRepository.createQueryBuilder("user");
		userQb.limit(3);
		const users = await userQb.getMany();
		if (users.length > 0) {
			throw new BadRequestException("Server already seeded");
		}
		let role = this.rolesRepository.create({ name: "admin" });
		role.permissions = Object.values(Permissions); /* Full permissions */
		role = await this.rolesRepository.save(role);
		let everyoneGroup = this.groupsRepository.create({ name: "everyone" });
		everyoneGroup = await this.groupsRepository.save(everyoneGroup);
		let { email, password, nickname } = createUserDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const dbEveryoneGroup = await this.groupsRepository.find({
			where: { name: "everyone" },
		});
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			groups: dbEveryoneGroup,
		});
		user.roles = [role];
		user.groups = [everyoneGroup];
		user.ownedGroups = [everyoneGroup];
		await this.usersRepository.save(user);
		this.sendVerificationEmail(email);
		return user;
	}

	async signUp(createUserDto: CreateUserDto): Promise<User> {
		let { email, password, nickname } = createUserDto;
		email = email.toLowerCase();
		const salt = await bcrypt.genSalt();
		const hashedPassword = await bcrypt.hash(password, salt);
		const dbEveryoneGroup = await this.groupsRepository.find({
			where: { name: "everyone" },
		});
		const user = this.usersRepository.create({
			email,
			password: hashedPassword,
			nickname,
			groups: dbEveryoneGroup,
		});
		await this.usersRepository.save(user);
		this.sendVerificationEmail(email);
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

	async googleSignIn(req: any) {
		if (!req.user) {
			throw new InternalServerErrorException("User not found");
		} else {
			const payload: JwtPayload = { email: req.user.email };
			const accessToken: string = this.jwtService.sign(payload);
			return {
				accessToken,
			};
		}
	}

	async sendVerificationEmail(email: string) {
		const payload: JwtPayload = { email };
		const token: string = this.jwtService.sign(payload, {
			secret: process.env.SMTP_EMAIL_VERIFICATION_JWT_SECRET,
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
			this.mailerService.sendMail({
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
		}
	}

	async testSendVerificationEmail() {
		const payload: JwtPayload = { email: process.env.SMTP_TEST_TO };
		const token: string = this.jwtService.sign(payload, {
			secret: process.env.SMTP_EMAIL_VERIFICATION_JWT_SECRET,
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
			this.mailerService.sendMail({
				from: `"${process.env.SMTP_USERNAME}" <${process.env.SMTP_USER}>` /* sender address */,
				to: process.env
					.SMTP_TEST_TO /* list of receivers, comma separated */,
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
		}
	}

	async verifyEmail(verifyEmailDto: VerifyEmailDto) {
		const { verificationToken } = verifyEmailDto;
		const payload: JwtPayload = this.jwtService.verify(verificationToken, {
			secret: process.env.SMTP_EMAIL_VERIFICATION_JWT_SECRET,
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
}
