# Architecture and Design

This system implements monolithic architecture. However, accounts are separated into two sub-systems.

The internal account system is used for internal organization **members**, and the external account system (optional) is used for external **users**, note that we use **members** and **users** to differentiate the two.

This pattern reduces security risks and improves compliance, it's also easier to maintain and scale.

## Permission Design

https://github.com/kyung-lee-official/permission-design

## Internal Members

### Common Compliance

-   Any newly created (including seeded, signed-up) member must be assigned to the `everyone` member-group, and cannot be removed from the `everyone` member-group.
-   member-group name must be unique. The server should incrementally name the new member-group if the name already exists.
-   Each member-group has a owner. By default, the creater will be added to the member-group and the owner will be assigned to the creater.
-   member-group owner can't remove herself from the member-group.
-   The owner of a member-group can be transferred to another member of the member-group by admin.
-   Only admin can freeze or unfreeze a member-group owner, then admin will be assigned to the owner of the member-group.
-   Only admin can delete a member-group owner, then admin will be assigned to the owner of the member-group.

-   Any newly created (including seeded, signed-up) member must be assigned to the `default` member-role, but members are allowed to be removed from the `default` member-role.
-   member-role name must be unique. The server should incrementally name new member-roles if the name already exists.
-   The `admin` member-role must be verified before performing any actions.
-   The `admin` member-role has full permissions and `admin` member-role cannot be frozen or deleted. The `admin` member-role's permissions cannot be changed.
-   The `admin` member-role must have and only have one member, and can be transferred to another member, this action can only be performed by the `admin` member-role. `admin` member-role can't be transferred to a frozen member.
-   The `default` member-role has permission `GET_MEMBER_ME` and `default` member-role cannot be deleted.

-   All members can't freeze themselves.

-   All email must be saved in lower case.

### member-server-settings

-   [x] Allow or block public sign ups.
-   [ ] Allow or block Google sign ups.

### member-auth

-   [x] Seed with email. If a member accesses the sign up page, the sign up page should send a `GET /auth/isSeeded` request to check if at least one member exists, if at least one member already exists, return `{ "isSeeded": true }`, frontend then redirects to the sign in page.
        If frontend sends a `GET /auth/seed` request, check if at least one member exists, if at least one member already exists, return `400` bad request.
        If no member exists, create a new member.
        Create an `admin` member-role, assign the member-role to the member.
        Create an `everyone` member-group, and assign the member-group owner to the member.
        Create a `default` member-role, The `default` member-role has permissions `GET_MEMBER_ME`.
-   [ ] Seed with Google.
-   [x] Sign up a new member.
-   [x] Check if sign-up is available.

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

-   [x] Create a new member manually by email, `CREATE_MEMBER` permission required.
-   [x] Conditionally find members by query email (case nonsensitive), name, or member-role ids. member-role ids delimited by comma `','`, use **or** logic. `GET_MEMBERS` permission required.
-   [x] Get members by ids, `GET_MEMBERS` permission required.
-   [x] Get me, `GET_MEMBER_ME` permission required.
-   [x] Update a member by id, can update `name`, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [x] Update email by member id, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [x] Update member-roles by member id, `UPDATE_MEMBER_ROLE` permission required.
-   [x] Update password by member id, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [ ] Freeze or unfreeze a member by id, `UPDATE_MEMBER` permission required.
-   [x] Delete a member by id, `DELETE_MEMBER` permission required.
-   [ ] Transfer the `admin` member-role to another member, `TRANSFER_MEMBER_ADMIN` permission required.

### member-roles

-   [x] Update `admin` permissions to sync with _permissions.enum.ts_, `admin` member-role required.
-   [x] Create a member-role, `CREATE_MEMBER_ROLE` permission required.
-   [ ] Create a member-role by copying permissions of an existing member-role, `CREATE_MEMBER_ROLE` permission required.
-   [x] Get all member-roles, `GET_MEMBER_ROLES` permission required.
-   [x] Get a member-role by id, `GET_MEMBER_ROLES` permission required.
-   [x] Update a member-role by id, `UPDATE_MEMBER_ROLE` permission required.
-   [x] Delete a member-role by id, delete even if the member-role has members, `DELETE_MEMBER_ROLE` permission required.

### member-groups

-   [ ] Create a member-group, `CREATE_MEMBER_GROUP` permission required.
-   [x] Get all member-groups, `GET_MEMBER_GROUPS` permission required.
-   [x] Get a member-group by id, `GET_MEMBER_GROUPS` permission required.
-   [x] Update a member-group by id, `UPDATE_MEMBER_GROUP` permission required.
-   [ ] Transfer ownership of a member-group, `TRANSFER_MEMBER_GROUP_OWNER` permission required.
-   [x] Delete a member-group by id, delete even if the group has members, `DELETE_MEMBER_GROUP` permission required.

### permissions

`@UseGuards(PermissionsGuard)` and `@RequiredPermissions(Permissions.ACT_SOMETHING)` help filter out requesters without required permissions.

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

# API

[Member Auth](http://localhost:3001/api/member-auth)

[Members](http://localhost:3001/api/members)

[member-groups](http://localhost:3001/api/member-groups)

[member-roles](http://localhost:3001/api/member-roles)

[Member Server Settings](http://localhost:3001/api/member-server-settings)

# Time Consistency

https://github.com/kyung-lee-official/nextjs-sandbox/tree/main/src/app/styles/date

# Todo

-   [ ] Refactor project to comply the OpenAPI 3.1.0 standard.
-   [ ] Audit `update` & `transferOwnership` in member-groups.service.ts
-   [ ] Finish up admin-permissions.e2e-spec.ts
-   [ ] Finish up limitations for unverified members
-   [ ] Finish up freeze member logic
-   [ ] Check new email logic and sign up logic, if the new email is already taken, return 400 bad request
