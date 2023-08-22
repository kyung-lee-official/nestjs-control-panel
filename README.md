# Product Requirement Document

## server-settings

-   [x] Allow or block public sign ups.
-   [ ] Allow or block Google sign ups.

## auth

-   [x] Seed. If a user accesses the sign up page, the sign up page should send a `GET /auth/isSeeded` request to check if at least one user exists, if at least one user already exists, return `{ "isSeeded": true }`, frontend then redirects to the sign in page.
        If frontend sends a `GET /auth/seed` request, check if at least one user exists, if at least one user already exists, return `400` bad request.
        If no user exists, create a new user, `email` saved as lower case. Create an `admin` role, assign the role to the user. Create an `everyone` group, and assign the user as the group owner. Create a `common` role, any newly created user will be assigned to this role.
-   [ ] Sign up a new user, `email` saved in lower case, `CREATE_USER` permission required， and assign the user to the `everyone` group.
-   [x] Users must sign in to apply any operations after the server is seeded.
-   [x] Check if sign-up is available

### Google OAuth

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

#### Delete Connections from Third-Party Apps

To delete connections from third-party apps:

1. Go to [Google Account](https://myaccount.google.com/).

1. On the left navigation panel, click **Security**.

1. On the **Your connections to third-party apps & services** panel, select the app or service you want to remove.

## users

-   [ ] Create a new user, `email` saved as lower case, `CREATE_USER` permission required， and assign the user to the `everyone` group.
-   [x] Conditionally find users by query email (case insensitive), nickname, or roleIds. roleIds delimited by comma `','`, use **or** relationship. `GET_USERS` permission required.
-   [x] Find users by ids, `GET_USERS` permission required.
-   [x] Find a user by id, `GET_USERS | GET_ME` permission required.
-   [x] Update a user by id, can update `nickname`, `UPDATE_USER | UPDATE_ME` permission required.
-   [x] Update email by user id, `UPDATE_USER | UPDATE_ME` permission required.
-   [x] Update roles by user id, `UPDATE_USER` permission required.
-   [x] Update password by user id, `UPDATE_USER | UPDATE_ME` permission required.
-   [x] Delete a user by id, `DELETE_USER` permission required.

## roles

`role` name can be duplicated (except `admin` and `common`), but `role` permissions must be unique.

-   [x] Update `admin` permissions to sync with _permissions.enum.ts_, `admin` role required.
-   [x] Create a role, `CREATE_ROLE` permission required.
-   [ ] Create a role by copying permissions of an existing role, `CREATE_ROLE` permission required.
-   [x] Find all roles, `GET_ROLES` permission required.
-   [x] Find a role by id, `GET_ROLES` permission required.
-   [x] Update a role by id, `UPDATE_ROLE` permission required.
-   [x] Delete a role by id, reject if the role has users, `DELETE_ROLE` permission required.
-   [ ] The `admin` role name must be unique.
-   [x] The `admin` role has full permissions can not be deleted. The `admin` role's permissions can not be changed.
-   [x] The `admin` role can only has one user.
-   [ ] The `admin` role ownership (role doesn't have an "ownership" concept, but the implementation must follow the rule that the `admin` role can only have one user) can be transferred to another user, this action can only be performed by the `admin` role user.
-   [x] The `admin` user can not be deleted.
-   [ ] The `common` role name must be unique.
-   [x] The `common` role has permissions `GET_ME`.
-   [x] The `common` role can not be deleted.

## groups

-   [x] Create a group, `CREATE_GROUP` permission required.
-   [x] Find all groups, `GET_GROUPS` permission required.
-   [x] Find a group by id, `GET_GROUPS` permission required.
-   [x] Update a group by id, `UPDATE_GROUP` permission required.
-   [x] Delete a group by id, reject if the group has users, `DELETE_GROUP` permission required.

## permissions

`@UseGuards(PermissionsGuard)` and `@RequiredPermissions(Permissions.ACT_SOMETHING)` help filter out requesters without required permissions.

CASL adds fields and conditions to the existing permission system to realize complex rules.

-   Realize field-specific rules: https://casl.js.org/v6/en/guide/restricting-fields

-   Realize grouping, so requesters can only access resources belongs them. For example, the requestee must belongs to at least one group that is **owned** by the requester.

Other permission rule logic must be implemented in corresponding services. For example, the `admin` role must have a user. When changing roles of a user, if the user belongs to the `admin` role, we can't simply remove the user from `admin`. Also, we can't add the `admin` role to a user without removing the current `admin` user.

-   [x] Find all permissions.

## Discord

### discordDrawCampaigns

-   id
-   name
-   description
-   rule
-   drawStartDate
-   drawEndDate
-   paidStartDate
-   paidEndDate
-   discordDrawRecords (One-to-Many)
-   chituboxOrders (One-to-Many)
-   createdDate
-   updatedDate

-   [ ] Create a draw campaign, `name`, `rule`, `startDate`, `endDate` required. `CREATE_DISCORD_DRAW_CAMPAIGN` permission required.
-   [ ] Fetch orders from CHITUBOX, this will create a required. `CREATE_DISCORD_DRAW_CAMPAIGN` permission required.
-   [ ] Find draw campaigns, by `name`, `startDate`. `FIND_DISCORD_DRAW_CAMPAIGNS` permission required.
-   [ ] Get a campaign by id. `GET_DISCORD_DRAW_CAMPAIGN` permission required.

### discordDrawCampaignRules

```ts
enum RuleTypes {
	FIRST_N = "FIRST_N",
	N_TH = "N_TH",
	N_CHANCES = "N_CHANCES",
}

type DiscordDrawCampaignRules = {
	type: RuleTypes;
	firstN?: number;
	nth?: number[];
	nChances?: number;
};
```

### discordDrawRecords

-   id
-   discordDrawCampaign (Many-to-One)
-   discordUserId
-   chituboxOrderId
-   drawCount (default `0`, max `nChances`)
-   isHit
-   createdDate
-   updatedDate

-   [ ] Create a draw record.
    -   `chituboxOrderId` and `discordUserId` from discord required.
    -   `discordDrawCampaign` required.
-   [ ] Find draw records by `discordDrawCampaignId`, `discordUserId`, `email`.
-   [ ] Find hit draw records by `discordDrawCampaignId`.
-   [ ] Find a draw records by `id`.

### chituboxOrders

-   id
-   discordDrawCampaign (Many-to-One)
-   chituboxOrderId
-   email
-   paidDate

-   [ ] Create orders using `discordDrawCampaignId`, send a request to CHITUBOX server to fetch orders info with given `paidStartDate` and `paidEndDate`. `CREATE_CHITUBOX_ORDERS` permission required.

## CHITUBOX Manual Analytics

### chituboxManualFeedbacks

-   id
-   url
-   payload
-   ip
-   country

*   [x] Create a feedback.
*   [x] Find feedbacks by `startDate` and `endDate`.

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
		createdDate: "2023-06-20T04:05:53.606Z",
		updatedDate: "2023-06-20T04:05:53.606Z",
	},
	{
		id: "3",
		pageId: "/en-US/chitubox-basic/v2.0.0/introduction",
		url: "manual.chitubox.com/en-US/docs/chitubox-basic/latest/introduction",
		payload: "USEFUL",
		ip: "65.49.207.134",
		country: "US",
		createdDate: "2023-06-21T10:05:27.467Z",
		updatedDate: "2023-06-21T10:05:27.467Z",
	},
];
```
