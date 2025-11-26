const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('ws');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
const MAX_USER_AMOUNT = 50

const server = http.createServer(app);

const wss = new Server({ server, path: "/notificationHub" });

wss.on('connection', (ws) => {
  console.log('New WS connection');

  const sendNotification = () => {
    ws.send(JSON.stringify({
      type: "ReceiveMessage",
      payload: new Date().getTime()
    }));
  }

  sendNotification();

  const interval = setInterval(() => {
    sendNotification();
  }, 60_000);

  ws.on('message', (res) => {
    const msg = JSON.parse(res)
    console.log(msg)
    if (msg.type === 'SynchronizeUser' && msg.payload >= 0) {
      MOCK_USERS[msg.payload] = {
        ...MOCK_USERS[msg.payload],
        protectedProjects: MOCK_USERS[msg.payload].protectedProjects + Math.floor(Math.random() * 10)
      }

      ws.send(JSON.stringify({
        type: 'SynchronizeUserFinished',
        payload: MOCK_USERS[msg.payload]
      }))
    }
    console.log(`Received from client: ${msg}`);
  });

  ws.on('close', () => {
    clearInterval(interval);
    console.log('Connection closed');
  });
});

server.listen(9334, () => {
  console.log('WS mock server running on ws://localhost:9334/notificationHub');
});



const restApp = express();
restApp.use(cors());
restApp.use(bodyParser.json());

const MOCK_USERS = Array.from({ length: MAX_USER_AMOUNT }).map((_, idx) => ({
  id: idx + 1,
  name: `User${idx + 1}`,
  role: idx % 2 === 0 ? 'Admin' : 'User',
  email: `user${idx + 1}@example.com`,
  protectedProjects: Math.floor(Math.random() * 50)
}));

restApp.get('/users', (req, res) => {
  let { filter, role, sort, page = 1, pageSize = 10 } = req.query;
  page = Number(page) || 1;
  pageSize = Number(pageSize) || 10;

  let results = [...MOCK_USERS];

  if (filter) {
    const term = filter.toLowerCase();
    results = results.filter(u =>
      u.name.toLowerCase().includes(term) ||
      u.role.toLowerCase().includes(term)
    );
  }
  if (role) {
    results = results.filter(u => u.role.toLowerCase() === role.toLowerCase());
  }

  if (sort) {
    const sorters = sort.split(',');
    results.sort((a, b) => {
      for (let s of sorters) {
        let dir = 1;
        if (s.startsWith('-')) {
          dir = -1;
          s = s.slice(1);
        }
        if (a[s] < b[s]) return -1 * dir;
        if (a[s] > b[s]) return dir;
      }
      return 0;
    });
  }

  const total = results.length;
  const start = (page - 1) * pageSize;
  results = results.slice(start, start + pageSize);

  res.json({
    results,
    total,
    page,
    pageSize
  });
});

restApp.get('/users/:id', (req, res) => {
  const user = MOCK_USERS.find(u => u.id === Number(req.params.id));
  if (!user) return res.status(404).json({});
  res.json(user);
});

restApp.listen(9333, () => {
  console.log('REST API mock server running on http://localhost:9333');
});
