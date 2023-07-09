import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "./../src/app.module";
import { Client } from "pg";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

describe("Seed flow (e2e)", () => {
	let app: INestApplication;
	let accessToken: string;

	beforeAll(async () => {
		/* Drop database "DATABASE_DEV" and re-create it */
		const dbClient = new Client({
			host: process.env.DATABASE_HOST_DEV,
			port: parseInt(process.env.DATABASE_PORT_DEV),
			user: process.env.DATABASE_USERNAME_DEV,
			password: process.env.DATABASE_PASSWORD_DEV,
			database: "postgres",
		});
		await dbClient.connect();
		await dbClient.query(
			`DROP DATABASE IF EXISTS "${process.env.DATABASE_DEV}" WITH (FORCE)`
		);
		await dbClient.query(
			`CREATE DATABASE "${process.env.DATABASE_DEV}" OWNER ${process.env.DATABASE_USERNAME_DEV}`
		);
		await dbClient.end();

		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		await app.init();
	}, 15000);

	it("GET /auth/isSeeded should be false", () => {
		return request(app.getHttpServer())
			.get("/auth/isSeeded")
			.expect(200)
			.expect({ isSeeded: false });
	});

	it("POST /auth/seed", () => {
		return request(app.getHttpServer())
			.post("/auth/seed")
			.send({
				email: process.env.E2E_TEST_EMAIL,
				nickname: process.env.E2E_TEST_NICKNAME,
				password: process.env.E2E_TEST_PASSWORD,
			})
			.expect(201)
			.then((response) => {
				expect(response.body.email).toBe(process.env.E2E_TEST_EMAIL);
				expect(response.body.password).toBe(undefined);
				expect(response.body.nickname).toBe(
					process.env.E2E_TEST_NICKNAME
				);
				expect(response.body.groups[0].name).toBe("everyone");
				expect(response.body.ownedGroups[0].name).toBe("everyone");
				expect(response.body.roles[0].name).toBe("admin");
				expect(response.body.isVerified).toBe(null);
			});
	}, 15000);

	it("GET /auth/isSeeded should be true", () => {
		return request(app.getHttpServer())
			.get("/auth/isSeeded")
			.expect(200)
			.expect({ isSeeded: true });
	});

	it("POST /auth/signin", () => {
		return request(app.getHttpServer())
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_EMAIL,
				password: process.env.E2E_TEST_PASSWORD,
			})
			.expect(201)
			.then((response) => {
				accessToken = response.body.accessToken;
			});
	}, 15000);

	it("GET /users/me", () => {
		return request(app.getHttpServer())
			.get("/users/me")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200)
			.then((response) => {
				expect(response.body.email).toBe(process.env.E2E_TEST_EMAIL);
				expect(response.body.password).toBe(undefined);
				expect(response.body.nickname).toBe(
					process.env.E2E_TEST_NICKNAME
				);
				expect(response.body.groups[0].name).toBe("everyone");
				expect(response.body.ownedGroups[0].name).toBe("everyone");
				expect(response.body.roles[0].name).toBe("admin");
				expect(response.body.isVerified).toBe(null);
			});
	}, 15000);

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});
