import { Injectable, NotFoundException } from "@nestjs/common";
import { CreatePaypalOrderDto } from "./dto/create-paypal-order.dto";
import axios from "axios";
import { CompletePaypalOrderDto } from "./dto/complete-paypal-order.dto";

type Product = {
	id: number;
	name: string;
	price: number;
};

@Injectable()
export class PaypalService {
	private products: Product[] = [
		{
			id: 1,
			name: "P1",
			price: 0.03,
		},
		{
			id: 2,
			name: "P2",
			price: 0.08,
		},
	];
	constructor() {}

	async createOrder(createPaypalDto: CreatePaypalOrderDto): Promise<any> {
		const { intent, productId } = createPaypalDto;
		const product = this.products.find((product) => {
			return (product.id = productId);
		});
		if (!product) {
			throw new NotFoundException("Product not found");
		}
		const res = await axios.post(
			"/v2/checkout/orders",
			{
				intent: intent,
				purchase_units: [
					{
						amount: {
							currency_code: "USD",
							value: product.price.toString(),
						},
					},
				],
			},
			{
				baseURL: process.env.PAYPAL_SANDBOX_BASEURL,
				headers: {
					"Content-Type": "application/json",
					Authorization: process.env.PAYPAL_ACCESS_TOKEN,
				},
			}
		);
		return res.data.id;
	}

	async completeOrder(createPaypalDto: CompletePaypalOrderDto): Promise<any> {
		const { orderId } = createPaypalDto;
		const res = await axios.post(
			`/v2/checkout/orders/${orderId}/capture`,
			null,
			{
				baseURL: process.env.PAYPAL_SANDBOX_BASEURL,
				headers: {
					"Content-Type": "application/json",
					Authorization: process.env.PAYPAL_ACCESS_TOKEN,
				},
			}
		);
		return { id: res.data.id, status: res.data.status };
	}

	findAll() {
		return `This action returns all paypal`;
	}

	findOne(id: number) {
		return `This action returns a #${id} paypal`;
	}

	update(id: number, updatePaypalDto: any) {
		return `This action updates a #${id} paypal`;
	}

	remove(id: number) {
		return `This action removes a #${id} paypal`;
	}
}
