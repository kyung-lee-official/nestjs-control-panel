import { Column, Entity, PrimaryColumn, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class MemberServerSetting {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	allowPublicSignUp: boolean;

	@Column()
	allowGoogleSignIn: boolean;
}
