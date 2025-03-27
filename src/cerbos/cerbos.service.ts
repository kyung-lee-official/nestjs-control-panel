import { Injectable } from "@nestjs/common";
import { GRPC as Cerbos } from "@cerbos/grpc";

@Injectable()
export class CerbosService {
	public cerbos: Cerbos;

	constructor() {
		this.cerbos = new Cerbos(process.env.CERBOS_HOST as string, {
			tls: false,
		});
	}
}
