import { Exclude } from "class-transformer";
import { Role } from "src/roles/entities/role.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

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

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedDate: Date;

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
