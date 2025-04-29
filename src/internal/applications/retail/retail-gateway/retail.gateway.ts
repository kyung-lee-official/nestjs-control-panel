import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Injectable } from "@nestjs/common";

@Injectable() /* make it injectable */
@WebSocketGateway({ namespace: "retail", cors: true })
export class RetailGateway {
	@WebSocketServer()
	server!: Server;

	afterInit() {
		console.log("retail Websockets initialized");
	}

	sendRatailSalesDataSavingProgress(data: {
		batchId: number;
		percentage: number;
	}) {
		this.server.emit("retail-sales-data-saving-progress", data);
	}

	disconnect() {
		this.server.disconnectSockets(true);
	}
}
