import { ApiOperationOptions, ApiResponseOptions } from "@nestjs/swagger";

export const getTencentCosTempCredentialApiOperationOptions: ApiOperationOptions =
	{
		summary: "Get the temporary credential for Tencent COS",
		description: `# Get the temporary credential for Tencent COS
secretId, secretKey, bucket, region are stored in the server environment variables, the frontend should not know them.

* [临时密钥生成及使用指引](https://cloud.tencent.com/document/product/436/14048)
* [使用临时密钥访问 COS](https://cloud.tencent.com/document/product/436/68283)
`,
		externalDocs: {
			description: "使用临时密钥访问 COS",
			url: "https://cloud.tencent.com/document/product/436/68283",
		},
	};

export const getTencentCosTempCredentialApiOkResponseOptions: ApiResponseOptions =
	{
		description: "Return the temporary credential for Tencent COS",
		content: {
			"application/json": {
				examples: {
					"Temporary credential for Tencent COS": {
						value: {
							expiredTime: 1705383233,
							expiration: "2024-01-16T05:33:53Z",
							credentials: {
								sessionToken:
									"***********************************************************************************************************************************oYEUgyE4Vvl0i0-K21kB****************************************************7f3Xb9ii9-****2NzOm_******************************yGPRWWvNAsspVBGfY2pfdhaXUxIxFUHDBDf8RZnjyxTz*************_0bxk********-*******************************ehSIFFviZAyDS-oM****z-vJu-6uP************************************************vPNxP-xKI**************************************-hFhRNWHBosM1kb_BZbfu****************************************Wks0980VpFJc3MZya6NVFS*********************************************************JV2cZ9NvaRVbe0dLBkZD******************************************GclS2TWOdzO02L*************g_feCCU**P_j******",
								tmpSecretId:
									"*******lJ_*************UgG0-_*************mlXZIlBSZbFWbyx***********",
								tmpSecretKey:
									"wl****/*****************xZ**********4Ke****=",
							},
							requestId: "1351****-****-****-****-ef****90****",
							startTime: 1705383113,
						},
					},
				},
			},
		},
	};
