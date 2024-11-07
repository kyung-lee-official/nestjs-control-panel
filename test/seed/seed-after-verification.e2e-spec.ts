import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import TestAgent from "supertest/lib/agent";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test checks if the admin is verified, and permissions of the admin after verification"
	);
	console.log(
		"❕Make sure to verify the member from the email or API before starting this test"
	);
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

let app: INestApplication;
let req: TestAgent<request.Test>;
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
	req = request(app.getHttpServer());
}, 15000);

describe("Seed flow, check if the admin is verified", () => {
	it("POST /member-auth/signin", async () => {
		const res = await req.post("/member-auth/signin").send({
			email: process.env.E2E_TEST_ADMIN_EMAIL,
			password: "1234Abcd!",
		});
		expect(res.status).toBe(201);
		accessToken = res.body.accessToken;
		console.log("Admin token: ", accessToken);
	}, 15000);

	let adminRes: request.Response;
	it("GET /members/me member should return", async () => {
		adminRes = await req
			.get("/members/me")
			.set("Authorization", `Bearer ${accessToken}`);
		expect(adminRes.status).toBe(200);
	}, 15000);

	it("GET /members/me check email", async () => {
		expect(adminRes.body.email).toBe(process.env.E2E_TEST_ADMIN_EMAIL);
	});

	it("GET /members/me password should be undefined", async () => {
		expect(adminRes.body.password).toBe(undefined);
	});

	it("GET /members/me check name", async () => {
		expect(adminRes.body.name).toBe(
			process.env.E2E_TEST_ADMIN_NAME
		);
	});

	it("GET /members/me admin should be added to 'everyone' member-group", async () => {
		expect(adminRes.body.memberGroups[0].name).toBe("everyone");
	});

	it("GET /members/me admin should own 'everyone' member-group", async () => {
		expect(adminRes.body.ownedGroups[0].name).toBe("everyone");
	});

	it("GET /members/me admin should have 'admin' member-role", async () => {
		expect(adminRes.body.memberRoles[0].name).toBe("admin");
	});

	it("GET /members/me admin should be verified", async () => {
		expect(adminRes.body.isVerified).toBe(true);
	});
});

describe("Permissions test flow", () => {
	it("POST /member-roles should return 'admin' and 'default' given the member is already verified", async () => {
		const res = await req
			.post("/member-roles/find")
			.set("Authorization", `Bearer ${accessToken}`)
			.send({
				roleIds: [],
			});
		expect(res.status).toBe(200);
		expect(res.body[0].name).toBe("admin");
		expect(res.body[1].name).toBe("default");
	}, 15000);
});
