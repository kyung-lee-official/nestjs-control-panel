import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "../entities/user.entity";

@Injectable()
export class NotFrozenGuard implements CanActivate {
	constructor(
		@InjectRepository(User)
		private usersRepository: Repository<User>
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let { user } = context.switchToHttp().getRequest();
		const dbUser = await this.usersRepository.findOne({
			where: {
				id: user.id,
			},
		});
		if (dbUser.isFrozen) {
			throw new ForbiddenException("User is frozen");
		} else {
			return true;
		}
	}
}
