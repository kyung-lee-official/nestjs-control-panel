import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";
import { SeedServerDto } from "../dto/seed-server.dto";

export class SeedServer {
	email: string;
	nickname: string;
	password: string;

	constructor(dto: SeedServerDto) {
		this.email = dto.email;
		this.nickname = dto.nickname;
		this.password = dto.password;
	}
}

export const seedServerOperationOptions: ApiOperationOptions = {
	summary: "Seed the server with a member",
	description: `# Seed the server
Only available when the server is not seeded, the seed member will be the admin`,
};

export const seedServerBodyOptions: ApiBodyOptions = {
	type: SeedServer,
	description: "The member to seed the server with",
	examples: {
		"Seed server": {
			value: {
				email: "admin@example.com",
				nickname: "admin",
				password: "1234Abcd!",
			},
		},
	},
};

export const seedServerOkResponseOptions: ApiResponseOptions = {
	description: "Return the seeded member",
	content: {
		"application/json": {
			examples: {
				"Seed the server": {
					value: {
						id: "563e0a5d-dbcc-4ac3-acda-0ec841d78056",
						email: "kyung.lee@qq.com",
						nickname: "Kyung",
						isVerified: false,
						isFrozen: false,
						createdAt: "2024-10-22T04:59:12.984Z",
						updatedAt: "2024-10-22T04:59:12.984Z",
						memberRoles: [
							{
								id: "admin",
								name: "Admin",
								superRoleId: null,
								createdAt: "2024-10-22T04:59:12.984Z",
								updatedAt: "2024-10-22T04:59:12.984Z",
								subRoles: [
									{
										id: "default",
										name: "Default",
										superRoleId: "admin",
										createdAt: "2024-10-22T04:59:12.984Z",
										updatedAt: "2024-10-22T04:59:12.984Z",
									},
								],
							},
						],
					},
				},
			},
		},
	},
};

export const seedServerBadRequestResponseOptions: ApiResponseOptions = {
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
};
