# Architecture and Design

This system implements monolithic architecture. However, accounts are separated into two sub-systems.

The internal account system is used for internal organization **members**, and the external account system (optional) is used for external **users**, note that we use **members** and **users** to differentiate the two.

This pattern reduces security risks and improves compliance, it's also easier to maintain and scale.

## Permission Design

https://github.com/kyung-lee-official/permission-design

## Common Compliance

-   member-role `admin` and `default` should be created when the server is seeded, and be assigned to the first member. `admin` should be assigned to `default`'s `superRole` field. Both `admin` and `default` member-roles are immutable, except for their associate members. every member must be assigned to the `default` member-role, which only has `["get] me` permission.
-   Any newly created member must be assigned to the `default` role.
-   Only admin can create, update and delete member-roles
-   Only admin can freeze or unfreeze a member
<!-- -   The `admin` member-role must be verified before performing any actions. -->
-   The `admin` member-role has full permissions and `admin` member-role cannot be frozen or deleted. member-role `admin`'s permissions cannot be changed.
-   members can't freeze themselves.
-   email must be saved in lower case.

## API

### Server

http://localhost:3001/api/internal#/Server

### Authentication

http://localhost:3001/api/internal#/Authentication

#### Google OAuth

Make sure your dev server is able to connect to Google's OAuth server (use Proxifier if needed).

Example `request.user` send from Google to our server:

```json
{
	"message": "User information from google",
	"user": {
		"email": "kyung.lee.official@gmail.com",
		"givenName": "Kyung",
		"familyName": "Lee",
		"picture": "https://lh3.googleusercontent.com/a/AAcHTtcWTJrj8osBrYMrYErRMM7g6UmmOWegJpP0PSA5fXxmJw=s96-c",
		"accessToken": "****.****************************************************************************************************************************************************************************************************************"
	}
}
```

##### Delete Connections from Third-Party Apps

To delete connections from third-party apps:

1. Go to [Google Account](https://myaccount.google.com/).
1. On the left navigation panel, click **Security**.
1. On the **Your connections to third-party apps & services** panel, select the app or service you want to remove.

### Members

http://localhost:3001/api/internal#/Members

## member-roles

http://localhost:3001/api/internal#/Roles

## permissions

CASL adds fields and conditions to the existing permission system to realize complex rules.

-   Realize field-specific rules: https://casl.js.org/v6/en/guide/restricting-fields

-   Realize grouping, so requesters can only access resources belongs them. For example, the requestee must belongs to at least one member-group that is **owned** by the requester.

Other permission rule logic must be implemented in corresponding services file instead of the _casl-ability.factory.ts_ file.

Checkout each service section doc for details.

-   [x] Get all permissions.

## CHITUBOX Manual Analytics

### chituboxManualFeedbacks

-   id
-   url
-   payload
-   ip
-   country

-   [x] Create a feedback.
-   [x] Find feedbacks by `startDate` and `endDate`.

Response example:

```ts
[
	{
		id: "2",
		pageId: "/en-US/chitubox-basic/v2.0.0/introduction",
		url: "manual.chitubox.com/en-US/docs/chitubox-basic/latest/introduction",
		payload: "USEFUL",
		ip: "65.49.207.134",
		country: "US",
		createdAt: "2023-06-20T04:05:53.606Z",
		updatedAt: "2023-06-20T04:05:53.606Z",
	},
	{
		id: "3",
		pageId: "/en-US/chitubox-basic/v2.0.0/introduction",
		url: "manual.chitubox.com/en-US/docs/chitubox-basic/latest/introduction",
		payload: "USEFUL",
		ip: "65.49.207.134",
		country: "US",
		createdAt: "2023-06-21T10:05:27.467Z",
		updatedAt: "2023-06-21T10:05:27.467Z",
	},
];
```

# Time Consistency

https://github.com/kyung-lee-official/nextjs-sandbox/tree/main/src/app/styles/date
