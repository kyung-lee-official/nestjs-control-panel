import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import * as request from "supertest";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"❕Make sure to verify the user from the email before starting this test"
	);
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
		const moduleFixture: TestingModule = await Test.createTestingModule({
			imports: [AppModule],
		}).compile();

		app = moduleFixture.createNestApplication();
		app.useGlobalPipes(
			new ValidationPipe({
				whitelist: true,
			})
		);
		app.enableCors();
		await app.init();
	}, 15000);

	it("POST /auth/signin", async () => {
		return await request(app.getHttpServer())
			.post("/auth/signin")
			.send({
				email: process.env.E2E_TEST_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201)
			.then((response) => {
				accessToken = response.body.accessToken;
			});
	}, 15000);

	it("GET /users/me user should be verified", async () => {
		return await request(app.getHttpServer())
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
				expect(response.body.isVerified).toBe(true);
			});
	}, 15000);

	it("GET /roles should return 'admin' and 'common' given the user is already verified", async () => {
		return await request(app.getHttpServer())
			.get("/roles")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200)
			.then((response) => {
				expect(response.body[0].name).toBe("admin");
				expect(response.body[1].name).toBe("common");
			});
	}, 15000);

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});
