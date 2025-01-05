const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let questions = [];

// API to add MCQs
app.post('/api/mcq', (req, res) => {
    const { question, options } = req.body;
    if (!question || !options || options.length < 2) {
        return res.status(400).json({ message: 'Invalid question or options.' });
    }
    questions.push({ question, options });
    res.status(201).json({ message: 'MCQ added successfully!' });
});

// API to get MCQs
app.get('/api/mcq', (req, res) => {
    res.json(questions);
});

// Notify teacher about tab switch
app.post('/api/notify-teacher', (req, res) => {
    const { student, event } = req.body;
    if (!student || !event) {
        return res.status(400).json({ message: 'Invalid notification data.' });
    }
    io.emit('student-event', { student, event });
    res.status(200).json({ message: 'Teacher notified successfully!' });
});

// Start the server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
