import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import TestAgent from "supertest/lib/agent";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"Run 'pnpm exec prisma migrate reset' to reset the database before running this test."
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let req: TestAgent<request.Test>;
let adminAccessToken: string;

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
	req = request(app.getHttpServer());
}, 30000);

describe("Seed flow, before verification (e2e)", () => {
	it("GET /member-auth/isSeeded should be false", async () => {
		const res = await req.get("/member-auth/isSeeded").expect(200);
		expect(res.body.isSeeded).toBe(false);
	});

	let seedRes: request.Response;
	it("POST /member-auth/seed simple password should be failed", async () => {
		seedRes = await req.post("/member-auth/seed").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			name: process.env.E2E_TEST_ADMIN_NAME,
			password: "1234",
		});
		expect(seedRes.status).toBe(400);
		expect(seedRes.body.message.includes("password is too weak")).toBe(
			true
		);
	});

	it("POST /member-auth/seed with upper-case email should be saved as all-lower cases.", async () => {
		const upperCaseEmail = process.env.E2E_TEST_ADMIN_EMAIL.toUpperCase();
		const lowerCaseEmail = process.env.E2E_TEST_ADMIN_EMAIL.toLowerCase();
		console.log(`✉️ Using email: ${upperCaseEmail}`);
		seedRes = await req.post("/member-auth/seed").send({
			email: upperCaseEmail,
			name: process.env.E2E_TEST_ADMIN_NAME,
			password: "1234Abcd!",
		});
		expect(seedRes.status).toBe(201);
		expect(seedRes.body.email).toBe(lowerCaseEmail);
	}, 30000);

	it("POST /member-auth/seed should not return plain text password.", async () => {
		expect(seedRes.body.password).toBe(undefined);
	}, 30000);

	it("POST /member-auth/seed check name", async () => {
		expect(seedRes.body.name).toBe(process.env.E2E_TEST_ADMIN_NAME);
	});

	it("POST /member-auth/seed admin should be added to 'everyone' member-group", async () => {
		expect(seedRes.body.memberGroups[0].name).toBe("everyone");
	});

	it("POST /member-auth/seed admin should owned 'everyone' member-groups", async () => {
		expect(seedRes.body.ownedGroups[0].name).toBe("everyone");
	});

	it("POST /member-auth/seed admin should be added to 'admin' member-role", async () => {
		expect(seedRes.body.memberRoles[0].name).toBe("admin");
	});

	it("POST /member-auth/seed admin should not be verified yet", async () => {
		expect(seedRes.body.isVerified).toBe(false);
	});

	it("GET /member-auth/isSeeded should be true", async () => {
		const res = await req.get("/member-auth/isSeeded").expect(200);
		expect(res.body.isSeeded).toBe(true);
	});

	it("POST /member-auth/seed seed again should be failed", async () => {
		const res = await req.post("/member-auth/seed").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			name: process.env.E2E_TEST_ADMIN_NAME,
			password: "1234Abcd!",
		});
		expect(res.status).toBe(400);
	}, 30000);
});

describe("Test sign in flow", () => {
	it("POST /member-auth/signin sign in with wrong password should fail", async () => {
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
		adminAccessToken = res.body.accessToken;
		console.log("adminAccessToken: " + adminAccessToken);
	}, 30000);

	it("GET /member-auth/isSignedIn should be true", async () => {
		const res = await req
			.get("/member-auth/isSignedIn")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(200);
		expect(res.body.isSignedIn).toBe(true);
	});
});

describe("Test server settings", () => {
	it("GET /member-server-settings/isSignUpAvailable should be false by default", async () => {
		const res = await req.get("/member-server-settings/isSignUpAvailable");
		expect(res.status).toBe(200);
		expect(res.body.isSignUpAvailable).toBe(false);
	});

	it("GET /member-server-settings/isGoogleSignInAvailable should be false by default", async () => {
		const res = await req.get(
			"/member-server-settings/isGoogleSignInAvailable"
		);
		expect(res.status).toBe(200);
		expect(res.body.isGoogleSignInAvailable).toBe(false);
	});
});

describe("Operations should be forbidden before verification", () => {
	it("POST /member-roles/find should be false given the member is not verified yet", async () => {
		const res = await req
			.post("/member-roles/find")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.expect(403);
	});

	it("POST /members/create create a member manually by email should fail", async () => {
		const res = await req
			.post("/members/create")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				email: process.env.E2E_TEST_MEMBER_3_EMAIL,
				name: process.env.E2E_TEST_MEMBER_3_NAME,
				password: "1234Abcd!",
			});
		expect(res.status).toBe(403);
	});
});
