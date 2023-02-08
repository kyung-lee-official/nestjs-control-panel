# Product Requirement Document

## auth

- [x] Seed. If a user accesses the sign up page, the sign up page should send a `GET /auth/hasAdmin` request to check if at least one user exists, if at least one user already exists, return `{ "hasAdmin": true }`, frontend then redirects to the sign in page.
      If frontend sends a `GET /auth/seed` request, check if at least one user exists, if at least one user already exists, return `400` bad request. If no user exists, create a new user, `email` saved as lower case.Create an `admin` role, and assign the role to the current user.
- [x] Create a new user, `email` saved as lower case, `CREATE_USER` permission required.
- [x] Users must sign in to apply any operations after the system is seeded.

## users

- [x] Conditionally find users by query email (case insensitive), nickname, or roleIds. roleIds delimited by comma `','`, use **or** relationship. `GET_USERS` permission required.
- [x] Find users by ids, `GET_USERS` permission required.
- [x] Find a user by id, `GET_USER | GET_ME` permission required.
- [x] Update a user by id, can update `nickname`, `UPDATE_USER | UPDATE_ME` permission required.
- [x] Update email by user id, `UPDATE_EMAIL | UPDATE_MY_EMAIL` permission required.
- [x] Update roles by user id, `UPDATE_USER_ROLES` permission required.
- [x] Update password by user id, `UPDATE_PASSWORD | UPDATE_MY_PASSWORD` permission required.
- [x] Delete a user by id, `DELETE_USER` permission required.

## roles

- [x] Update `admin` permissions to sync with _permissions.enum.ts_, `admin` role required.
- [x] Create a role, `CREATE_ROLE` permission required.
- [ ] Create a role by copying permissions of an existing role, `CREATE_ROLE` permission required.
- [x] Find all roles, `GET_ROLES` permission required.
- [x] Find a role by id, `GET_ROLES` permission required.
- [x] Update a role by id, `UPDATE_ROLE` permission required.
- [x] Delete role by id, reject if the role has users, `DELETE_ROLE` permission required.
- [x] `admin` role has full permissions and can not be changed or deleted.
- [x] `admin` role can only has one user.
- [x] a `admin` user can not be deleted.

## permissions

- [x] Find all permissions.

## Discord

### discordDrawCampaigns

- id
- name
- description
- rule
- drawStartDate
- drawEndDate
- paidStartDate
- paidEndDate
- discordDrawRecords (One-to-Many)
- chituboxOrders (One-to-Many)
- createdDate
- updatedDate

- [ ] Create a draw campaign, `name`, `rule`, `startDate`, `endDate` required. `CREATE_DISCORD_DRAW_CAMPAIGN` permission required.
- [ ] Fetch orders from CHITUBOX, this will create a required. `CREATE_DISCORD_DRAW_CAMPAIGN` permission required.
- [ ] Find draw campaigns, by `name`, `startDate`. `FIND_DISCORD_DRAW_CAMPAIGNS` permission required.
- [ ] Get a campaign by id. `GET_DISCORD_DRAW_CAMPAIGN` permission required.

### discordDrawCampaignRules

```ts
enum RuleTypes {
  FIRST_N = 'FIRST_N',
  N_TH = 'N_TH',
  N_CHANCES = 'N_CHANCES',
}

type DiscordDrawCampaignRules = {
  type: RuleTypes;
  firstN?: number;
  nth?: number[];
  nChances?: number;
};
```

### discordDrawRecords

- id
- discordDrawCampaign (Many-to-One)
- discordUserId
- chituboxOrderId
- drawCount (default `0`, max `nChances`)
- isHit
- createdDate
- updatedDate

- [ ] Create a draw record.
  - `chituboxOrderId` and `discordUserId` from discord required.
  - `discordDrawCampaign` required.
- [ ] Find draw records by `discordDrawCampaignId`, `discordUserId`, `email`.
- [ ] Find hit draw records by `discordDrawCampaignId`.
- [ ] Find a draw records by `id`.

### chituboxOrders

- id
- discordDrawCampaign (Many-to-One)
- chituboxOrderId
- email
- paidDate

- [ ] Create orders using `discordDrawCampaignId`, send a request to CHITUBOX server to fetch orders info with given `paidStartDate` and `paidEndDate`. `CREATE_CHITUBOX_ORDERS` permission required.

## CHITUBOX Manual Analytics

### chituboxManualFeedbacks

- id
- url
- payload
- ip
- country

* [x] Create a feedback.
* [x] Find feedbacks by `startDate` and `endDate`.

# Env
```
DATABASE=
DATABASE_HOST=
DATABASE_PORT=
DATABASE_USERNAME=
DATABASE_PASSWORD=
JWT_SECRET=
TZ=UTC
AUTHORIZATION="Bearer xxx"
```
