import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication, ValidationPipe } from "@nestjs/common";
import request from "supertest";
import { AppModule } from "../../src/app.module";
import { inspect } from "../test-utils";
import TestAgent from "supertest/lib/agent";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
	console.log(
		"This test flow assumes that the server is seeded, and the admin member is verified already."
	);
	console.log(
		"If the test members are already signed up, run remove-test-members.e2e-spec.ts to remove test members before running this test."
	);
	console.log(
		"This test flow signs in as admin, and then creates test members."
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

describe("Check server status", () => {
	it("POST /member-auth/signup should be false given server setting doesn't allow sign up", async () => {
		const res = await req
			.post("/member-auth/signup")
			.send({
				email: process.env.E2E_TEST_MEMBER_1_EMAIL,
				nickname: process.env.E2E_TEST_MEMBER_1_NICKNAME,
				password: "1234Abcd!",
			})
			.expect(403);
	});
});

describe("Enable sign up", () => {
	it("POST /member-auth/signin sign in as admin and change server settings to allow sign up", async () => {
		const res = await req
			.post("/member-auth/signin")
			.send({
				email: process.env.E2E_TEST_ADMIN_EMAIL,
				password: "1234Abcd!",
			})
			.expect(201);
		adminAccessToken = res.body.accessToken;
		await req
			.patch("/member-server-settings")
			.set("Authorization", `Bearer ${adminAccessToken}`)
			.send({
				allowPublicSignUp: true,
				allowGoogleSignIn: false,
			})
			.expect(200);
		await req
			.get("/member-server-settings/isSignUpAvailable")
			.expect(200)
			.expect({ isSignUpAvailable: true });
	}, 30000);
});

describe("Sign up new members", () => {
	let member1Res: request.Response;
	const upperCaseEmail = process.env.E2E_TEST_MEMBER_1_EMAIL.toUpperCase();
	const lowerCaseEmail = process.env.E2E_TEST_MEMBER_1_EMAIL.toLowerCase();
	console.log(`✉️ Using email: ${upperCaseEmail}`);

	it("POST /member-auth/signup sign up 'test member 1'", async () => {
		member1Res = await req
			.post("/member-auth/signup")
			.send({
				email: upperCaseEmail,
				nickname: process.env.E2E_TEST_MEMBER_1_NICKNAME,
				password: "1234Abcd!",
			})
			.expect(201);
	});

	it("Check email of 'test member 1', should be lower case", () => {
		expect(member1Res.body.email).toBe(lowerCaseEmail);
	});

	it("Check password is not returned in the response", () => {
		expect(member1Res.body.password).toBe(undefined);
	});

	it("Check nickname of 'test member 1'", () => {
		expect(member1Res.body.nickname).toBe(
			process.env.E2E_TEST_MEMBER_1_NICKNAME
		);
	});

	it("Check 'test member 1' is in the 'everyone' group", () => {
		expect(member1Res.body.memberGroups[0].name).toBe("everyone");
	});

	it("Check 'test member 1' doesn't have owned groups", () => {
		expect(member1Res.body.ownedGroups).toEqual([]);
	});

	it("Check 'test member 1' has the role 'default'", () => {
		expect(member1Res.body.memberRoles[0].name).toBe("default");
	});

	it("Check 'test member 1' is not verified", () => {
		expect(member1Res.body.isVerified).toBe(false);
	});

	it("POST /member-auth/signup sign up as 'test member 2' and repeat the check flow", async () => {
		const req = request(app.getHttpServer());
		const member2Res = await req
			.post("/member-auth/signup")
			.send({
				email: process.env.E2E_TEST_MEMBER_2_EMAIL,
				nickname: process.env.E2E_TEST_MEMBER_2_NICKNAME,
				password: "1234Abcd!",
			})
			.expect(201);
		expect(member2Res.body.email).toBe(process.env.E2E_TEST_MEMBER_2_EMAIL);
		expect(member2Res.body.password).toBe(undefined);
		expect(member2Res.body.nickname).toBe(
			process.env.E2E_TEST_MEMBER_2_NICKNAME
		);
		expect(member2Res.body.memberGroups[0].name).toBe("everyone");
		expect(member2Res.body.ownedGroups).toEqual([]);
		expect(member2Res.body.memberRoles[0].name).toBe("default");
		expect(member2Res.body.isVerified).toBe(false);
	});
});
