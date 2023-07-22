import { INestApplication } from "@nestjs/common";
import { Test, TestingModule } from "@nestjs/testing";
import { Client } from "pg";
import { AppModule } from "../src/app.module";

if (process.env.ENV === "DEV") {
	console.log("✅ Running in DEV mode");
} else {
	console.error(
		"❌ Fatal! Running e2e tests in modes other than DEV is not allowed!"
	);
	process.exit(1);
}

describe("Drop database (e2e)", () => {
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
	}, 30000);

	it("Table numbers should not be 0", async () => {
		const dbClient = new Client({
			host: process.env.DATABASE_HOST_DEV,
			port: parseInt(process.env.DATABASE_PORT_DEV),
			user: process.env.DATABASE_USERNAME_DEV,
			password: process.env.DATABASE_PASSWORD_DEV,
			database: process.env.DATABASE_DEV,
		});
		await dbClient.connect();
		const res = await dbClient.query(
			`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
		);
		expect(res.rows.length).not.toBe(0);
		expect(res.rows).toContainEqual({
			table_name: "chitubox_manual_feedback",
		});
		expect(res.rows).toContainEqual({ table_name: "group" });
		expect(res.rows).toContainEqual({ table_name: "role" });
		expect(res.rows).toContainEqual({ table_name: "server_setting" });
		expect(res.rows).toContainEqual({ table_name: "user" });
		expect(res.rows).toContainEqual({ table_name: "user_groups_group" });
		expect(res.rows).toContainEqual({ table_name: "user_roles_role" });
		await dbClient.end();
	}, 30000);

	it("All tables should be empty", async () => {
		const dbClient = new Client({
			host: process.env.DATABASE_HOST_DEV,
			port: parseInt(process.env.DATABASE_PORT_DEV),
			user: process.env.DATABASE_USERNAME_DEV,
			password: process.env.DATABASE_PASSWORD_DEV,
			database: process.env.DATABASE_DEV,
		});
		await dbClient.connect();
		const res = await dbClient.query(
			`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
		);
		for (const row of res.rows) {
			const tableName = row.table_name;
			const res = await dbClient.query(`SELECT * FROM "${tableName}"`);
			expect(res.rows.length).toBe(0);
		}
		await dbClient.end();
	}, 30000);
});
