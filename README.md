# Aircall Pager
## Installation
This is a node.js application, so please make sure you have a valid node.js installation.
Node version > 11

1. Download the project
2. cd into-your-directory
3. npm install
4. npm run test
5. npm run dev:apiserver

The server will listen on port 8081. You can configure some specs (like the port) by editing config.json file in the root directory.

Once the server is up and running, you can call the following URLS:

### http://localhost:8081/services/<serviceId>/crashed
This should create a service (if not already created) and mark it as crashed.
By looking at the console, you will see the progress of the events (like mails and sms messages being sent...)

### http://localhost:8081/services/<serviceId>/acknowledge
This should acknowledge a newly created alert

### http://localhost:8081/services/<serviceId>/healthy
This should mark the service as healthy

You can also run an experimental "console" application, by executing
* npx babel-node --no-warnings src/executables/runConsole.js
Keep in mind that the console version has limitations that we will eventually discuss later.

Most of the adapters have been "mocked up".
SMS and EMAILS are not really sent.
A persistence DB has been created (JSON file based) as well as a policy server (or, actually, a JSON repository to read policies from).



