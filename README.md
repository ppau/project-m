# Project-M

[![Build Status](https://snap-ci.com/ppau/project-m/branch/master/build_image)](https://snap-ci.com/ppau/project-m/branch/master)

## Dev setup

0. Install [vagrant](https://www.vagrantup.com/downloads.html)
0. Install [ansible](https://docs.ansible.com/ansible/intro_installation.html)
0. Clone the project

        git clone https://github.com/ppau/project-m.git

0. Start the vagrant vm

        vagrant up && vagrant provision

0. Log onto the vm

        vagrant ssh

0. Find the project files

        cd ~/vagrant

0. Install dependencies

        npm install

0. Add stripe keys [Optional]

        1. First option is to add stripe config file:
                1. Make a file called stripe-config.json in /config file (see /config/strip-config.json.example for format)
                2. Visit [stripe](https://dashboard.stripe.com/test/dashboard)
                3. Click your account -> account settings
                4. Click API keys
                5. Add the ones you wish to use into /config/stripe-config.json (for test and dev)

        2. Second option is to declare them at run time:
                1. Add STRIPE_SECRET_KEY="somekey" to environment vars
                2. Add STRIPE_PUBLIC_KEY="anotherkey" to environment vars
                3. Alternatively, define them at runtime before npm start, see below

                eg: STRIPE_SECRET_KEY="sk_test_randomNumbersAndLetters" STRIPE_PUBLIC_KEY="anotherkey" npm start

        If you do both options, the run time declaration is used instead of the config file.

0. Email configuration [Optional]

        1. Run `which sendmail` in a terminal
        2. Add EMAIL_SERVER="Path to sendmail" to environment vars
        3. Turn on the toggles for the emails that will be activated in each specific environment (config/default.json, config/staging.json, config/production.json)
            - For the verification email set "sendEmails" to true

0. Run the tests

        npm test

0. Run the acceptance tests

        1. First set up a admin email and admin password:
                export ACCEPTANCE_EMAIL=some email here
                export ACCEPTANCE_PASSWORD=some password here
        2. Start the server:
                npm start
        3. Then run:
                npm run acceptanceTests

0. Start the server

        npm start

### webpack

0. npm install webpack -g

0. webpack --progress --colors --watch

### Tests

0. Run server side tests

        npm run serverTests

0. Run client side tests

        npm run componentTests

0. Run a specific server side test

        NODE_ENV=test node --harmony node_modules/jasmine/bin/jasmine.js spec/integration/membersSpec.js

0. Run smoke tests against an external target

        NODE_ENV=test INSTANCE_URL=http://myinstance.mydomain.com node --harmony node_modules/jasmine/bin/jasmine.js spec/integration

### Utility scripts

0. Migrate the database (run automatically as part and npm start or npm test)

        ./node_modules/sequelize-cli/bin/sequelize db:migrate

0. Create an admin user to access the treasurer/secretary views

        npm run createAdmin

### Pull a copy of the staging db from heroku

0. heroku pg:backups capture --app <app_name>

0. curl -o db/dumps/latest.dump `heroku pg:backups public-url`

0. (in the vm) pg_restore --verbose --clean --no-acl --no-owner -h localhost -U project-m -d project-m db/dumps/latest.dump

Happy hacking!

## Optional setup

### JShint

0. Install [plugin](http://jshint.com/install/)

### WebStorm

0. Install [webstorm](https://www.jetbrains.com/webstorm/download/)

0. Open preferences -> Languages and frameworks

0. Change javascript to ECMAScript 6

0. Setup run configuration to node and "javascript/file" to be bin/www

0. Optionally install vagrant plugin
