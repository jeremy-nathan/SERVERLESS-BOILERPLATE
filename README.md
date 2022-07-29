# api-serverless

Serverless Node.js Typescript Project

### How do I create this project? ###
1. Install serverless by run `npm install -g serverless`
2. Create your personal access token from GitHub
3. Run `serverless create -u "https://x-access-token:PERSONAL_ACCESS_TOKEN@github.com/MoneyMatchEng/serverless-aws-nodejs-typescript.git" -p YOUR_LOCAL_REPO_PATH`

### How do I get set up? ###

* Summary of set up
1. Setup your AWS Credentials for local.
2. Run `npm install` or `yarn`, prefer to use `yarn` packager.
* Configuration
1. Create a `.env.stg` file at root folder and copy value from `.env.example`.
* Dependencies
* Database configuration
* How to run tests
1. Press `F5` to run debug to testing in local
* Deployment instructions
1. Staging - run `npm run sls-deploy-stg` or `yarn sls-deploy-stg`
2. Production - run `npm run sls-deploy-prod` or `yarn sls-deploy-prod`
