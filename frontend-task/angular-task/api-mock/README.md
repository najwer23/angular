# SignalR Test Server for Angular

A minimal server containing a WebSocket hub and a REST API endpoint (for testing the Angular application).

## Getting Started

- npm install
- npm start

The WS server will start at:  
`ws://localhost:9334/notificationHub`

It sends a "ReceiveMessage" message containing the current timestamp every minute.

The REST API endpoint for fetching the list of users is available at:  
`http://localhost:9333/users`

This endpoint supports pagination, filtering, and sorting. Examples:

- Get all: `GET http://localhost:5000/users`
- Filter by name containing "Jan": `GET http://localhost:5000/users?filter=Jan`
- Only admins: `GET http://localhost:5000/users?role=Admin`
- Sort by name descending: `GET http://localhost:5000/users?sort=-name`
- Page 2, 5 items per page: `GET http://localhost:5000/users?page=2&pageSize=5`

The endpoint to get a specific user is available at:  
`http://localhost:9333/users/:id`
