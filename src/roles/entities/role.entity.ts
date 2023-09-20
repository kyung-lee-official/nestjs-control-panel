import { Permissions } from "../../permissions/permissions.enum";
import { User } from "../../users/entities/user.entity";
import {
	Column,
	CreateDateColumn,
	Entity,
	ManyToMany,
	PrimaryGeneratedColumn,
	UpdateDateColumn,
} from "typeorm";

@Entity()
export class Role {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

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
		},
		{
			onDelete: "CASCADE",
		}
	)
	users: User[];
}
