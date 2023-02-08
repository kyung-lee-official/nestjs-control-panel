import { Permissions } from "src/permissions/permissions.enum";
import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column({ unique: true })
	role: string;

	@Column("simple-array", { nullable: true })
	permissions?: Permissions[];

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;

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
