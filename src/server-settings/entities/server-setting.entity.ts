import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class ServerSetting {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	allowPublicSignUp: boolean;

	@Column()
	allowGoogleSignIn: boolean;
}
