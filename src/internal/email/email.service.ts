import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
	UnauthorizedException,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { MailerService } from "@nestjs-modules/mailer";
import { VerifyEmailDto } from "../authentication/dto/verify-email.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { ForgetPasswordDto } from "./dto/forget-password.dto";
import { ChangeEmailDto } from "./dto/change-email.dto";

@Injectable()
export class EmailService {
	constructor(
		private readonly jwtService: JwtService,
		private readonly mailerService: MailerService,
		private readonly prismaService: PrismaService
	) {}

	async sendVerificationEmail(email: string) {
		const payload = { email };
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
					`${process.env.FRONTEND_HOST}/sign-up/email-verification?token=${token}`
				) /* plain text body */,
				html: htmlTemplate(
					`${process.env.FRONTEND_HOST}/sign-up/email-verification?token=${token}`
				) /* html body */,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send verification email"
			);
		}
	}

	/**
	 * Send initial password email to the member
	 * @param email Email
	 * @param password Initial password
	 */
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

	async changeEmail(
		requesterEmail: string,
		changeEmailDto: ChangeEmailDto
	): Promise<{ isSent: boolean; jwt: string }> {
		const { newEmail } = changeEmailDto;
		if (requesterEmail === newEmail) {
			throw new BadRequestException(
				"New email is the same as the old one"
			);
		}
		const isEmailExists = await this.prismaService.member.findUnique({
			where: { email: newEmail },
		});
		if (isEmailExists) {
			throw new BadRequestException("Email already exists");
		}

		await this.prismaService.member.update({
			where: {
				email: requesterEmail,
			},
			data: {
				email: newEmail,
				isVerified: false,
			},
		});

		const jwt = this.jwtService.sign({ email: newEmail });

		const payload = {
			email: newEmail,
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
					`${process.env.FRONTEND_HOST}/auth/new-email-verification?token=${token}`
				) /* plain text body */,
				html: htmlTemplate(
					`${process.env.FRONTEND_HOST}/auth/new-email-verification?token=${token}`
				) /* html body */,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send verification email"
			);
		}

		return { isSent: true, jwt: jwt };
	}

	async verifyEmail(
		verifyEmailDto: VerifyEmailDto
	): Promise<{ isVerified: boolean }> {
		const { verificationToken } = verifyEmailDto;
		const payload = this.jwtService.verify(verificationToken, {
			secret: process.env.SMTP_JWT_SECRET,
		});
		const { email } = payload;
		const member = await this.prismaService.member.update({
			where: {
				email: email,
			},
			data: {
				isVerified: true,
			},
		});
		if (!member) {
			throw new BadRequestException("Member not found");
		}
		return { isVerified: true };
	}

	async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
		const { email } = forgetPasswordDto;
		const member = await this.prismaService.member.findUnique({
			where: { email: email },
		});
		if (!member) {
			throw new NotFoundException("Member not found");
		}
		this.sendForgetPasswordEmail(email);
		return;
	}

	async sendForgetPasswordEmail(email: string) {
		const payload = { email };
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
					`${process.env.FRONTEND_HOST}/sign-in/reset-password?token=${token}`
				) /* plain text body */,
				html: htmlTemplate(
					`${process.env.FRONTEND_HOST}/sign-in/reset-password?token=${token}`
				) /* html body */,
			});
		} catch (error) {
			console.error(error);
			throw new InternalServerErrorException(
				"Failed to send forget password email"
			);
		}
	}
}
