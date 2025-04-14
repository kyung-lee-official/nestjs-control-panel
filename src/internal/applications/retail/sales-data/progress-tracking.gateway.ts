import { WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server } from "socket.io";
import { Injectable } from "@nestjs/common";

@Injectable() /* make it injectable */
@WebSocketGateway({ namespace: "retail", cors: true })
export class ProgressTrackingGateway {
	@WebSocketServer()
	server!: Server;

	sendProgress(data: { progress: number }) {
		this.server.emit("retail-sales-data-saving-progress", data);
	}

	disconnect() {
		this.server.disconnectSockets(true);
	}
}
