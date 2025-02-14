# Architecture and Design

This system implements monolithic architecture. However, accounts are separated into two sub-systems.

The internal account system is used for internal organization **members**, and the external account system (optional) is used for external **users**, note that we use **members** and **users** to differentiate the two.

This pattern reduces security risks and improves compliance, it's also easier to maintain and scale.

## Permission Design

https://github.com/kyung-lee-official/permission-design

## Common Compliance

-   member-role `admin` and `default` should be created when the server is seeded, and be assigned to the first member. `admin` should be assigned to `default`'s `superRole` field. Both `admin` and `default` member-roles are immutable, except for `admin`'s associate members. every member must be assigned to the `default` member-role, which only has `["get"] me` permission, `admin` role must have at least one member.
-   Only admin can create, update and delete member-roles.
-   Only admin can freeze or unfreeze a member.
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

# Time Consistency

https://github.com/kyung-lee-official/nextjs-sandbox/tree/main/src/app/styles/date
