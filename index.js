const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

app.use(cors())
app.use(express.static('public'))
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

let users = [];
let exercises = [];

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

// Create new user
app.post('/api/users', (req, res) => {
  const username = req.body.username;
  const _id = uuidv4();
  const newUser = { username, _id };
  users.push(newUser);
  res.json(newUser);
});

// Get all users
app.get('/api/users', (req, res) => {
  res.json(users);
});

// Add exercise to a user
app.post('/api/users/:_id/exercises', (req, res) => {
  const { _id } = req.params;
  const { description, duration, date } = req.body;

  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  const parsedDate = date ? new Date(date) : new Date();
  if (isNaN(parsedDate.getTime())) {
    return res.json({ error: 'Invalid date' });
  }

  const exercise = {
    userId: _id,
    description,
    duration: parseInt(duration, 10),
    date: parsedDate.toDateString(),
  };
  exercises.push(exercise);
  res.json({
    username: user.username,
    description: exercise.description,
    duration: exercise.duration,
    date: exercise.date,
    _id: user._id,
  });
});

// Get a user exercise log
app.get('/api/users/:_id/logs', (req, res) => {
  const { _id } = req.params;
  const { from, to, limit } = req.query;

  const user = users.find((u) => u._id === _id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  let userExercises = exercises.filter((e) => e.userId === _id);

  // Filter by date
  if (from) {
    const fromDate = new Date(from);
    if (!isNaN(fromDate.getTime())) {
      userExercises = userExercises.filter((e) => new Date(e.date) >= fromDate);
    }
  }
  if (to) {
    const toDate = new Date(to);
    if (!isNaN(toDate.getTime())) {
      userExercises = userExercises.filter((e) => new Date(e.date) <= toDate);
    }
  }

  //limit
  if (limit) {
    userExercises = userExercises.slice(0, parseInt(limit, 10));
  }

  res.json({
    username: user.username,
    count: userExercises.length,
    _id,
    log: userExercises.map((e) => ({
      description: e.description,
      duration: e.duration,
      date: e.date,
    })),
  });
});



const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
