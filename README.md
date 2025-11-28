## REAL-TIME SYNCHRONIZATION USING WEBSOCKETS WITH THE BACKEND

A simple Angular project that displays a list of users in a table, while also allowing filtering, sorting, and pagination. The front-end connection to the server in Express.js is handled using websockets.

The table's state depends on server results and front-end operations. ngRx (Redux) was used and then rewritten to use the session storage service as it makes more sense.

The application includes unit tests for the user listing.
