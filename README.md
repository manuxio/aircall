# Aircall Pager
## Installation
This is a node.js application, so please make sure you have a valid node.js installation.

Use node version > 12

1. Download the project
2. cd into-your-directory
3. npm install
4. npm run test
5. npm run dev:apiserver

The server will listen on port 8081. You can configure some specs (like the port) by editing config.json file in the root directory.

Once the server is up and running, you can call the following URLS:

### POST http://localhost:8081/services/*serviceId*/crashed
~~~
curl --location --request POST 'localhost:8081/services/serviceId/crashed' \
--header 'Content-Type: application/json' \
--data-raw '{
    "message": "Hello, I crashed :("
}'
~~~

This should create a service (if not already created) and mark it as crashed.
By looking at the console, you will see the progress of the events (like mails and sms messages being sent...)

### GET http://localhost:8081/services/*serviceId*/acknowledge
This should acknowledge a newly created alert

### GET http://localhost:8081/services/*serviceId*/healthy
This should mark the service as healthy

---

You can also run an experimental "console" application, by executing
* npx babel-node --no-warnings src/executables/runConsole.js help
* npx babel-node --no-warnings src/executables/runConsole.js service yourService -s nok -m message
* npx babel-node --no-warnings src/executables/runConsole.js service yourService -a
* npx babel-node --no-warnings src/executables/runConsole.js ls

_Keep in mind that the console version has limitations that we will eventually discuss later._

---

Most of the adapters have been "mocked up".
SMS and EMAILS are not really sent.
A persistence DB has been created (JSON file based) as well as a policy server (or, actually, a JSON repository to read policies from).



