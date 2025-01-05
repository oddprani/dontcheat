const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');


const app = express();
const server = http.createServer(app);
const io = new Server(server);



app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let questions = [];
let studentResponses = []; // Store student responses

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

// API to save student responses
app.post('/api/student-responses', (req, res) => {
    const { usn, name, answers } = req.body;
    if (!usn || !name || !answers || answers.length === 0) {
        return res.status(400).json({ message: 'Invalid student data.' });
    }
    studentResponses.push({ usn, name, answers });
    res.status(201).json({ message: 'Responses saved successfully!' });
});

// API to get all student responses
app.get('/api/student-responses', (req, res) => {
    res.json(studentResponses);
});

// Notify teacher about tab switch (with timestamp)
app.post('/api/notify-teacher', (req, res) => {
    const { student, event } = req.body;
    if (!student || !event) {
        return res.status(400).json({ message: 'Invalid notification data.' });
    }
    const timestamp = new Date().toLocaleString(); // Add timestamp
    io.emit('student-event', { student, event, timestamp });
    res.status(200).json({ message: 'Teacher notified successfully!' });
});

// Notify teacher about tab switch with timing (Same endpoint, unified)
app.post('/api/notify-tab-switch', (req, res) => {
    const { student, event } = req.body;
    if (!student || !event) {
        return res.status(400).json({ message: 'Invalid notification data.' });
    }
    const timestamp = new Date().toLocaleString(); // Add timestamp
    io.emit('student-event', { student, event, timestamp });
    res.status(200).json({ message: 'Teacher notified about tab switch successfully!' });
});

// API to get individual student responses by USN
app.get('/api/student-responses/:usn', (req, res) => {
    const { usn } = req.params;
    const student = studentResponses.find(s => s.usn === usn);
    if (!student) {
        return res.status(404).json({ message: 'Student not found' });
    }
    res.json(student);
});


// Serve the student response page
app.get('/student/:usn', (req, res) => {
    const usn = req.params.usn;
    // Here, we could potentially check if the student exists or not
    // But for now, we're just serving the HTML page
    res.sendFile(path.join(__dirname, 'public', 'student-response.html'));
});

// Start the server
server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
