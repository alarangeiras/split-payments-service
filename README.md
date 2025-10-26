## About
This service is responsible for handling split payments across multiple group members.

### **Requirements**:

1. **Group Management**:
    - Implement functionality to create expense groups.
    - A group must have (at least): a name.
    - Group members must have (at least): a name.
2. **Add Expenses**:
    - Allow group members to record expenses they have made into a group.
    - An expense must have (at least): a name, a dollar amount, and the payer.
    - For splits that result in decimals with a remainder, the leftover amount can be assigned to any member, as long as the assignment is deterministic.
    - Expenses should be split equally among all group members by default, with an option for a "partial split," where some group members are excluded. Assume for simplicity that splits are always equal among involved members. Examples:
        - In a group of 2 people, the expense would always be split 50/50.
        - In a group of 3 people:
            - If all are involved, the expense is split equally (e.g., 34/33/33—notice the rounding up).
            - If only 2 members out of 3 are involved, the expense is split equally between them (e.g., 50/50).
            - Uneven splits, such as 80% for one member and 10% for each of the other two, are out of scope.
3. **View Balances**:
    - Provide functionality to view each member's net balance within a group.
    - Positive balances indicate amounts owed to a member; negative balances indicate amounts a member owes.
4. **Settle Debts**:
    - Allow members to record settlements between members.
    - After a settlement, balances should update accordingly.
5. **File Upload Feature**:
    - Implement functionality to upload a CSV file containing a batch of expenses to be added to a group.
    - The CSV assumes the group and group members are already created for simplicity.
    - Use cloud storage to store and process the uploaded file.
6. **Email Notification**:
    - Design and implement an email notification system to inform group members when:
        - An expense is recorded.
        - A debt is settled.
    - The actual email content is not important as it's considered front-end work; raw JSON is acceptable.

## Solution - How it works

### Entities
- Groups are a way of create small portion of people. It could be since a small group of friends to a company vertical.
- Members are people who joined a group. For the sake simplicity, this app doesn´t handle members moviment across groups, or being removed from them.
- Expenses are anything that was bought by a group member and should be splitted by the remaining members (or a smaller cohort).
- Trasactions are any money moviment added or removed from anyone's wallet. It can be positive or negative
- Balance is the current transactions status. It's the sum of their amounts and can be positive or negative
- Settlement is a transaction between two group managers, they can settle a money transfer which is gonna create two transactions (1 positive and 1 negative) which will impact on their balances.

### Tech and libraries

- docker/compose for mocking external dependencies (I decided to no keep the app in a container during the development for the sake of simplicity)
- postgresql for the local DB (it could be a mysql for example, since I didn't used any native postgres feature). I chose a SQL DB since the schema looks like well defined
- redis for caching. The balances doesn't look like changing very offen, so I used redis cache to avoid hitting the DB all the time. To avoid inconsistencies any endpoint that changes transactions (which will impact the balances), automatically invalidates the cache
- localstack for mocking AWS resources. I used S3 to store the CSV (presigned url) and SNS to send notification events (emails)
- knexjs for DB DML/DDL. It's not a ORM, but it already takes care of SQL injection and it's pretty great straightforward library. It could be Sequelize in this case, but i personally thing Sequelize is more complex for this case. It also offers a nice DB migration structure, which keeps the DB very reproducible in many environments.
- luxon for date/time manipulation
- pino for logging
- zod for request validation (with some validation middlewares, now I think it could be only one middleware)
- supertest for integration tests
- a couple of bash scripts just to wait the external resources being available during the integration tests
- after finished I realized I could implement the husky library to force the linter and the formatter to be applied before commits

## Quality

This repo implements jest and supertest libraries in order to keep a nice QA and coverage. You can test things without them, but keep in mind we
can have future regressions because of lack of tests, so try to keep a more jest aproach during the development.

## Recomendations

- vscode
- node.js v22 (there is a .nvmrc in the project)
- [Biome extension](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) for format and linter.
- vscode settings
```
{
    "editor.defaultFormatter": "biomejs.biome",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
        "source.fixAll.biome": "always"
    }
}
```

## How to run the project

- create the .env file, you can use the example provided in the project: `cp .env.example .env`  
- create the external dependencies, you can run the compose file provided in the project: `docker compose up -d`
- install the local dependencies: `npm ci`
- run the migrations using the dev environment: `NODE_ENV=dev npm run migration`  
- run the dev server: `npm run dev`

### How to test the project

- integration tests can be ran using `npm run int`
- unit tests can be ran using: `npm run unit`
- you can run all at once by using: `npm test`