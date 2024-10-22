import { ApiOperationOptions, ApiResponseOptions } from "@nestjs/swagger";

export const refreshJwtOperationOptions: ApiOperationOptions = {
	description: `# Refresh the accessToken
Return the new accessToken

Note: The old accessToken will not be invalid after refreshing`,
};

export const refreshJwtOkResponseOptions: ApiResponseOptions = {
	description: "Return the new accessToken",
	content: {
		"application/json": {
			examples: {
				"Refresh the accessToken": {
					value: {
						accessToken:
							"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQGV4YW1wbGUuY29tIiwiaWF0IjoxNzAzNzU5Mzg3LCJleHAiOjE3MDM3NzAxODd9.lT3Q6ldWJGoMuuQ0gheQeLH4_pdgty29AAfa6utjZPw",
					},
				},
			},
		},
	},
};
