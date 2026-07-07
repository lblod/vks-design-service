# VKS design service

A mu-semtech service which implements the VLAG datamodel, to the extent of extracting the necessary information for importing
VKS designs for the purpose of generating regulations.

# How to use

## Environment variables

This service can be configured with a number of environment variables.
This includes those for [the template it is based on](https://github.com/mu-semtech/mu-javascript-template#configuration).

| variable       | required | default                                                                           | description                                                                                                                            |
| -------------- | -------- | --------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| `MOW_ENDPOINT` | no       | defaults to MU_SPARQL_ENDPOINT if it is set, `http://database:8890/sparql` if not | The sparql endpoint where the information about measures is held. Leave empty if this information is in the same stack as this service |
| `AUTH_CHECK_TYPE` | no       | 'session_group' | 'session_group' or 'agent'. Which query to use to determine the administrative unit the caller represents. 'session_group' should work with acm/idm logins and 'agent' is for use with the vendor-login-service. |


# Development

This service has an unusual and experimental test setup. To run the tests, simply:
```
npm install
npm run test
```

This will launch a vitest session. Through the use of https://testcontainers.com/ , a test-stack is launched for each test **suite**. 
The test-stack is defined by the compose file under `/test-app`.
Before each test, the database is cleared and re-seeded.
