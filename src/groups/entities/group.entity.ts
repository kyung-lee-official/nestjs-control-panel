import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToMany, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Group {
	@PrimaryGeneratedColumn()
	id: number;

	@Column()
	name: string;

	@ManyToOne(
		(type) => User,
		(user) => user.ownedGroups
	)
	owner: User;

	@ManyToMany(
		(type) => {
			return User;
		},
		(user) => {
			return user.groups;
		}
	)
	users: User[];

	@CreateDateColumn({ type: "timestamp with time zone" })
	createdDate: Date;

	@UpdateDateColumn({ type: "timestamp with time zone" })
	updatedDate: Date;
}
