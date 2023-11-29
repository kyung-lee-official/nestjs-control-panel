# Architecture and Design

This system implements monolithic architecture. However, accounts are separated into two sub-systems.

The internal account system is used for internal organization **members**, and the external account system (optional) is used for external **users**, note that we use **members** and **users** to differentiate the two.

This pattern reduces security risks and improves compliance, it's also easier to maintain and scale.

## Internal Members

### member-server-settings

-   [x] Allow or block public sign ups.
-   [ ] Allow or block Google sign ups.

### member-auth

-   [x] Seed. If a member accesses the sign up page, the sign up page should send a `GET /auth/isSeeded` request to check if at least one member exists, if at least one member already exists, return `{ "isSeeded": true }`, frontend then redirects to the sign in page.
        If frontend sends a `GET /auth/seed` request, check if at least one member exists, if at least one member already exists, return `400` bad request.
        If no member exists, create a new member, `email` saved as lower case. Create an `admin` role, assign the role to the member. Create an `everyone` group, and assign the member as the group owner. Create a `default` role, any newly created member will be assigned to this role and can't be removed from it.
-   [ ] Sign up a new member, `email` saved in lower case, `CREATE_MEMBER` permission required， and assign the member to the `everyone` group.
-   [x] Members must sign in to apply any operations after the server is seeded.
-   [x] Check if sign-up is available

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

### members

-   [ ] Create a new member, `email` saved as lower case, `CREATE_MEMBER` permission required， and assign the member to the `everyone` group.
-   [x] Conditionally find members by query email (case insensitive), nickname, or roleIds. roleIds delimited by comma `','`, use **or** relationship. `GET_MEMBERS` permission required.
-   [x] Find members by ids, `GET_MEMBERS` permission required.
-   [x] Find a member by id, `GET_MEMBERS | GET_MEMBER_ME` permission required.
-   [x] Update a member by id, can update `nickname`, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [x] Update email by member id, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [x] Update roles by member id, `UPDATE_MEMBER` permission required.
-   [x] Update password by member id, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [ ] Freeze or unfreeze a member by id, `UPDATE_MEMBER` permission required.
-   [x] Delete a member by id, `DELETE_MEMBER` permission required.

### member-roles

`role` name must be unique (`admin` and `default` are created when the server is seeded), the server should incrementally name the new role if the name already exists. The `default` role should be assigned to all members.

-   [x] Update `admin` permissions to sync with _permissions.enum.ts_, `admin` role required.
-   [x] Create a role, `CREATE_ROLE` permission required.
-   [ ] Create a role by copying permissions of an existing role, `CREATE_ROLE` permission required.
-   [x] Find all roles, `GET_ROLES` permission required.
-   [x] Find a role by id, `GET_ROLES` permission required.
-   [x] Update a role by id, `UPDATE_ROLE` permission required.
-   [x] Delete a role by id, delete even if the role has members, `DELETE_ROLE` permission required.
-   [x] The `admin` role has full permissions can not be deleted. The `admin` role's permissions can not be changed.
-   [x] The `admin` role can only has one member.
-   [ ] The `admin` role can only have one member, and can be transferred to another member, this action can only be performed by the `admin` role member. `admin` role can't be transferred to a frozen member.
-   [x] The `admin` member can not be deleted.
-   [x] The `default` role has permissions `GET_MEMBER_ME`.
-   [x] The `default` role can not be deleted.

### member-groups

`group` name must be unique. (`everyone` is created when the server is seeded), the server should incrementally name the new group if the name already exists.

-   [x] Create a group, `CREATE_MEMBER_GROUP` permission required.
-   [x] Find all groups, `GET_MEMBER_GROUPS` permission required.
-   [x] Find a group by id, `GET_MEMBER_GROUPS` permission required.
-   [x] Update a group by id, `UPDATE_MEMBER_GROUP` permission required.
-   [x] Delete a group by id, delete even if the group has members, `DELETE_MEMBER_GROUP` permission required.

### permissions

`@UseGuards(PermissionsGuard)` and `@RequiredPermissions(Permissions.ACT_SOMETHING)` help filter out requesters without required permissions.

CASL adds fields and conditions to the existing permission system to realize complex rules.

-   Realize field-specific rules: https://casl.js.org/v6/en/guide/restricting-fields

-   Realize grouping, so requesters can only access resources belongs them. For example, the requestee must belongs to at least one group that is **owned** by the requester.

Other permission rule logic must be implemented in corresponding services. For example, the `admin` role must have a member. When changing roles of a member, if the member belongs to the `admin` role, we can't simply remove the member from `admin`. Also, we can't add the `admin` role to a member without removing the current `admin` member.

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

## Todo

-   Finish up limitations for unverified members
-   Finish up freeze member logic
-   Check new email logic and sign up logic, if the new email is already taken, return 400 bad request
