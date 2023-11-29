import {
	CanActivate,
	ExecutionContext,
	ForbiddenException,
	Injectable,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../entities/member.entity";

@Injectable()
export class NotFrozenGuard implements CanActivate {
	constructor(
		@InjectRepository(Member)
		private membersRepository: Repository<Member>
	) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		let { member } = context.switchToHttp().getRequest();
		const dbMember = await this.membersRepository.findOne({
			where: {
				id: member.id,
			},
		});
		if (dbMember.isFrozen) {
			throw new ForbiddenException("Member is frozen");
		} else {
			return true;
		}
	}
}
