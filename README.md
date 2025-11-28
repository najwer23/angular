A simple Angular project that displays a list of users in a table, while also allowing filtering, sorting, and pagination. The frontend-to-server connection in Express.js is handled via websockets.

The table's state depends on server results and front-end operations. ngRx was used and then rewritten to use the session storage service.

The application includes unit tests for the user listing.