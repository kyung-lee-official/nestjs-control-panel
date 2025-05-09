import {
	BadRequestException,
	Injectable,
	InternalServerErrorException,
	NotFoundException,
} from "@nestjs/common";
import { Resend } from "resend";
import { ChangeEmailDto } from "./dto/change-email.dto";
import { PrismaService } from "src/prisma/prisma.service";
import { JwtService } from "@nestjs/jwt";
import { VerifyEmailDto } from "src/internal/authentication/dto/verify-email.dto";
import { ForgetPasswordDto } from "./dto/forget-password.dto";

@Injectable()
export class ResendService {
	private resend: Resend;

	constructor(
		private readonly prismaService: PrismaService,
		private readonly jwtService: JwtService
	) {
		this.resend = new Resend(process.env.RESEND_API_KEY);
	}

	async sendEmail(recipient: string, subject: string, html: string) {
		const { data, error } = await this.resend.emails.send({
			from: `${process.env.RESEND_SENDER_NAME} <${process.env.RESEND_SENDER_EMAIL}>`,
			to: recipient,
			subject: subject,
			html: html,
		});

		if (error) {
			throw new InternalServerErrorException(
				`Failed to send email: ${error.message}`
			);
		}

		return data;
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

		const htmlTemplate = (url: string) => `
			<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
				<h1>Verify your new email 📧</h1>
				<p>Please verify your new email by clicking on the following link:</p>
				<a href="${url}">👉🏼 Click here</a>
			</div>
		`;

		await this.sendEmail(
			newEmail,
			"Please verify your new email address 📧",
			htmlTemplate(
				`${process.env.FRONTEND_HOST}/auth/new-email-verification?token=${token}`
			)
		);

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

		const htmlTemplate = (url: string) => `
			<div style="text-align: center; font-family: sans-serif; border: 1px solid #ccc; border-radius: 5px; padding: 20px; background-color: #f5f5f5; max-width: 500px; margin: 0 auto;">
				<h1>Reset your password 🗝️</h1>
				<p>Please reset your password by clicking on the following link, the link remains valid for 10 minutes, if you did not request a password reset, please ignore this email:</p>
				<a href="${url}">👉🏼 Click here</a>
			</div>
		`;

		await this.sendEmail(
			email,
			"Reset your password 🗝️",
			htmlTemplate(
				`${process.env.FRONTEND_HOST}/sign-in/reset-password?token=${token}`
			)
		);
	}
}
