import { Exclude } from "class-transformer";
import { Role } from "src/roles/entities/role.entity";
import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class User {
	@PrimaryGeneratedColumn("uuid")
	id: string;

	@Column({ unique: true })
	email: string;

	@Column()
	nickname: string;

	@Column()
	@Exclude()
	password: string;

	@ManyToMany(
		(type) => {
			return Role;
		},
		(role) => {
			return role.users;
		}
	)
	@JoinTable()
	roles: Role[];
}
