# Architecture and Design

This system implements monolithic architecture. However, accounts are separated into two sub-systems.

The internal account system is used for internal organization **members**, and the external account system (optional) is used for external **users**, note that we use **members** and **users** to differentiate the two.

This pattern reduces security risks and improves compliance, it's also easier to maintain and scale.

## Permission Design

### Permission Granularity and Strategy

Permission Design can be complicated. Most cases, simply applying CRUD permissions to a generic resources is not enough. For example, **member** is a generic resource, a member may have a field called **isFrozen** that cannot be updated by the member himself, but can be updated by the admin. This is a **field-specific** permission. It's improper to use a permission like **UPDATE_MEMBER** to control this field, because you don't want to allow a group owner to be able to update the **isFrozen** field of a member of his group (especially in case the group owner is frozen, or he will be able to unfreeze himself), but at the same time, you might expect the group owner to be able to update other fields of the member of his group.

A solution to this issue is to separate permissions into two types: common permissions and sentitive (field-specific) permissions. Common permissions can be implemented by simply applying CRUD permissions to resources, and field-specific permissions need to be treated separately. In this case, we can create a permission called **UPDATE_MEMBER_IS_FROZEN** to control the **isFrozen** field of a member.

Another pitfall you need to be aware of is where relationships are involved. For example, someone who has the permission of **UPDATE_MEMBER** can update the member's belonging groups, but he doesn't have the permission of **UPDATE_MEMBER_GROUP** to add or remove members from the group. From the perspective of the member, he can update his own belonging groups, but from the perspective of the group, he can't update the group's members. This makes the permission system inconsistent. To solve this problem, we better separate the ability of updating the member's belonging groups out of the **UPDATE_MEMBER** permission, and consist with the **UPDATE_MEMBER_GROUP** permission only to control the group's members.

## Internal Members

### member-server-settings

-   [x] Allow or block public sign ups.
-   [ ] Allow or block Google sign ups.

### member-auth

-   [x] Seed with email. If a member accesses the sign up page, the sign up page should send a `GET /auth/isSeeded` request to check if at least one member exists, if at least one member already exists, return `{ "isSeeded": true }`, frontend then redirects to the sign in page.
        If frontend sends a `GET /auth/seed` request, check if at least one member exists, if at least one member already exists, return `400` bad request.
        If no member exists, create a new member, `email` saved as lower case.
        Create an `admin` member-role, assign the member-role to the member.
        Create an `everyone` group, and assign the member as the group owner.
        Create a `default` member-role, any newly created member will be assigned to this member-role and can't be removed from it. The `default` member-role has permissions `GET_MEMBER_ME`.
        `admin` must be verified before performing any actions.
-   [ ] Seed with Google.
-   [x] Sign up a new member, `email` saved in lower case, and assign the member to the `everyone` group.
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

-   [ ] Create a new member manually by email, `email` saved as lower case, `CREATE_MEMBER` permission required, and assign the member to the `everyone` group.
-   [x] Conditionally find members by query email (case nonsensitive), nickname, or member-role ids. member-role ids delimited by comma `','`, use **or** logic. `GET_MEMBERS` permission required.
-   [x] Get members by ids, `GET_MEMBERS` permission required.
-   [x] Get me, `GET_MEMBER_ME` permission required.
-   [x] Update a member by id, can update `nickname`, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [x] Update email by member id, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [x] Update member-roles by member id, `UPDATE_MEMBER_ROLE` permission required.
-   [x] Update password by member id, `UPDATE_MEMBER | UPDATE_MEMBER_ME` permission required.
-   [ ] Freeze or unfreeze a member by id, `UPDATE_MEMBER` permission required.
-   [x] Delete a member by id, `DELETE_MEMBER` permission required.

### member-roles

`member-role` name must be unique (`admin` and `default` are created when the server is seeded), the server should incrementally name the new member-role if the name already exists. The `default` member-role should be assigned to all members by default, but members are allowed to be removed from the `default` member-role.

-   [x] Update `admin` permissions to sync with _permissions.enum.ts_, `admin` member-role required.
-   [x] Create a member-role, `CREATE_MEMBER_ROLE` permission required.
-   [ ] Create a member-role by copying permissions of an existing member-role, `CREATE_MEMBER_ROLE` permission required.
-   [x] Get all member-roles, `GET_MEMBER_ROLES` permission required.
-   [x] Get a member-role by id, `GET_MEMBER_ROLES` permission required.
-   [x] Update a member-role by id, `UPDATE_MEMBER_ROLE` permission required.
-   [x] Delete a member-role by id, delete even if the member-role has members, `DELETE_MEMBER_ROLE` permission required.

member-role doesn't have an 'owner' concept, but the following rules must be applied:

-   [x] The `admin` member-role has full permissions can not be deleted. The `admin` member-role's permissions can not be changed.
-   [ ] The `admin` member-role must have and only only one member, and can be transferred to another member, this action can only be performed by the `admin` member-role. `admin` member-role can't be transferred to a frozen member.
-   [x] The `admin` member can not be deleted.
-   [x] The `default` member-role has permissions `GET_MEMBER_ME`.
-   [x] The `default` member-role can not be deleted.

### member-groups

Member group name must be unique. (`everyone` is created when the server is seeded), the server should incrementally name the new member-group if the name already exists.
Each member-group has a owner, by default, the creater will be added to the group and the owner will be assigned to the creater.
The owner can transfer the ownership to another member. The owner can't be removed from the group.

-   [ ] Create a group, add the creater to the group and and assign the creater as the owner, `CREATE_MEMBER_GROUP` permission required.
-   [x] Get all groups, `GET_MEMBER_GROUPS` permission required.
-   [x] Get a group by id, `GET_MEMBER_GROUPS` permission required.
-   [x] Update a group by id, `UPDATE_MEMBER_GROUP` permission required.
-   [ ] Transfer ownership of a group, `UPDATE_MEMBER_GROUP` permission required.
-   [x] Delete a group by id, delete even if the group has members, `DELETE_MEMBER_GROUP` permission required.

### permissions

`@UseGuards(PermissionsGuard)` and `@RequiredPermissions(Permissions.ACT_SOMETHING)` help filter out requesters without required permissions.

CASL adds fields and conditions to the existing permission system to realize complex rules.

-   Realize field-specific rules: https://casl.js.org/v6/en/guide/restricting-fields

-   Realize grouping, so requesters can only access resources belongs them. For example, the requestee must belongs to at least one group that is **owned** by the requester.

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

-   [ ] Finish up limitations for unverified members
-   [ ] Finish up freeze member logic
-   [ ] Check new email logic and sign up logic, if the new email is already taken, return 400 bad request
