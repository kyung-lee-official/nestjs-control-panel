import {
	ApiBodyOptions,
	ApiOperationOptions,
	ApiResponseOptions,
} from "@nestjs/swagger";
import { SeedServerDto } from "../dto/seed-server.dto";

export class SeedServer {
	email: string;
	name: string;
	password: string;

	constructor(dto: SeedServerDto) {
		this.email = dto.email;
		this.name = dto.name;
		this.password = dto.password;
	}
}

export const seedServerOperationOptions: ApiOperationOptions = {
	summary: "Seed the server with a member",
	description:
		"# Seed the server \n\nOnly available when the server is not seeded, the seed member will be `admin`, if frontend sends a seed request, check if at least one member exists, if at least one member already exists, return `400` bad request.",
};

export const seedServerBodyOptions: ApiBodyOptions = {
	type: SeedServer,
	description: "The member to seed the server with",
	examples: {
		"Seed server": {
			value: {
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				name: process.env.E2E_TEST_ADMIN_NAME,
				password: process.env.E2E_TEST_PASSWORD,
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
						name: "Kyung",
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
