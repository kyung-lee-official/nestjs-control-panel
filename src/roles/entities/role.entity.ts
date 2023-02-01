import { Permissions } from "src/permissions/permissions.enum";
import { User } from "src/users/entities/user.entity";
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	role: string;

	@Column("simple-array", { nullable: true })
	permissions?: Permissions[];

	@ManyToMany(
		(type) => {
			return User;
		},
		(user) => {
			return user.roles;
		}
	)
	users: User[];
}
