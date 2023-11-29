import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { Client } from "pg";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let req: request.SuperTest<request.Test>;
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
	app.useGlobalPipes(
		new ValidationPipe({
			whitelist: true,
		})
	);
	app.enableCors();
	await app.init();
	req = request(app.getHttpServer());
}, 30000);

describe("Seed flow, before verification (e2e)", () => {
	it("GET /member-auth/isSeeded should be false", async () => {
		const res = await req.get("/member-auth/isSeeded").expect(200);
		expect(res.body.isSeeded).toBe(false);
	});

	it("POST /member-auth/seed simple password should be failed", async () => {
		const res = await req.post("/member-auth/seed").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			nickname: process.env.E2E_TEST_ADMIN_NICKNAME,
			password: "1234",
		});
		expect(res.status).toBe(400);
		expect(res.body.message.includes("password is too weak")).toBe(true);
	});

	it("POST /member-auth/seed", async () => {
		const res = await req.post("/member-auth/seed").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			nickname: process.env.E2E_TEST_ADMIN_NICKNAME,
			password: "1234Abcd!",
		});
		expect(res.status).toBe(201);
		expect(res.body.email).toBe(process.env.E2E_TEST_ADMIN_EMAIL);
		expect(res.body.password).toBe(undefined);
		expect(res.body.nickname).toBe(process.env.E2E_TEST_ADMIN_NICKNAME);
		expect(res.body.memberGroups[0].name).toBe("everyone");
		expect(res.body.ownedGroups[0].name).toBe("everyone");
		expect(res.body.memberRoles[0].name).toBe("admin");
		expect(res.body.isVerified).toBe(false);
	}, 30000);

	it("GET /member-auth/isSeeded should be true", async () => {
		const res = await req.get("/member-auth/isSeeded").expect(200);
		expect(res.body.isSeeded).toBe(true);
	});

	it("POST /member-auth/seed seed again should be failed", async () => {
		const res = await req.post("/member-auth/seed").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			nickname: process.env.E2E_TEST_ADMIN_NICKNAME,
			password: "1234Abcd!",
		});
		expect(res.status).toBe(400);
	}, 30000);

	it("POST /member-auth/signin sign in with wrong password", async () => {
		const res = await req.post("/member-auth/signin").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			password: "4321Abcd!",
		});
		expect(res.status).toBe(401);
	}, 30000);

	it("POST /member-auth/signin", async () => {
		const res = await req.post("/member-auth/signin").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			password: "1234Abcd!",
		});
		expect(res.status).toBe(201);
		accessToken = res.body.accessToken;
	}, 30000);

	it("GET /member-auth/isSignedIn should be true", async () => {
		const res = await req
			.get("/member-auth/isSignedIn")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(200);
		expect(res.body.isSignedIn).toBe(true);
	});

	it("GET /member-roles should be false given the member is not verified yet", async () => {
		const res = await req
			.get("/member-roles")
			.set("Authorization", `Bearer ${accessToken}`)
			.expect(403);
	});

	it("Contains at least one test", () => {
		expect(true).toBe(true);
	});
});

describe("Test server settings", () => {
	it("GET /member-server-settings/isSignUpAvailable should be false by default", async () => {
		const res = await req.get("/member-server-settings/isSignUpAvailable");
		expect(res.status).toBe(200);
		expect(res.body.isSignUpAvailable).toBe(false);
	});

	it("GET /member-server-settings/isGoogleSignInAvailable should be false by default", async () => {
		const res = await req.get("/member-server-settings/isGoogleSignInAvailable");
		expect(res.status).toBe(200);
		expect(res.body.isGoogleSignInAvailable).toBe(false);
	});
});
