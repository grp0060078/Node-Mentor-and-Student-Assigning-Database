const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB
mongoose.connect('mongodb+srv://grp0060078:Raja123@cluster0.ib4jxpt.mongodb.net/node-day3');

// Define models
const mentorSchema = new mongoose.Schema({
  name: String,
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
});

const studentSchema = new mongoose.Schema({
  name: String,
  mentor: { type: mongoose.Schema.Types.ObjectId, ref: 'Mentor' },
});

const Mentor = mongoose.model('Mentor', mentorSchema);
const Student = mongoose.model('Student', studentSchema);



// Middleware
app.use(bodyParser.json());


// define home page
app.get('/',(req,res) =>{
  res.send("<h1>WELCOME</h1>")
})

// Implementation for creating a mentor
app.post('/api/mentors', async (req, res) => {
  try {
    const { name } = req.body;

    const mentor = new Mentor({ name });

    await mentor.save();

    res.status(201).json({ message: 'Mentor created successfully', mentor });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Implementation for assigning a student to a mentor
app.post('/api/mentors/assign-student/:mentorId', async (req, res) => {
  try {
    const { mentorId } = req.params;
    const { studentId } = req.body;

    const mentor = await Mentor.findById(mentorId);
    const student = await Student.findById(studentId);

    if (!mentor || !student) {
      return res.status(404).json({ error: 'Mentor or student not found' });
    }

    mentor.students.push(studentId);
    await mentor.save();

    student.mentor = mentorId;
    await student.save();

    res.json({ message: 'Student assigned to mentor successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Implementation for fetching all students for a particular mentor
app.get('/api/mentors/:mentorId/students', async (req, res) => {
  try {
    const { mentorId } = req.params;

    const mentor = await Mentor.findById(mentorId).populate('students');

    if (!mentor) {
      return res.status(404).json({ error: 'Mentor not found' });
    }

    res.json({ students: mentor.students });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Implementation for creating a student
app.post('/api/students', async (req, res) => {
  try {
    const { name } = req.body;

    const student = new Student({ name });

    await student.save();

    res.status(201).json({ message: 'Student created successfully', student });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Implementation for assigning or changing mentor for a particular student
app.put('/api/students/:studentId/assign-mentor/:mentorId', async (req, res) => {
  try {
    const { studentId, mentorId } = req.params;

    const student = await Student.findById(studentId);
    const mentor = await Mentor.findById(mentorId);

    if (!student || !mentor) {
      return res.status(404).json({ error: 'Student or mentor not found' });
    }

    if (student.mentor) {
      const prevMentor = await Mentor.findById(student.mentor);
      prevMentor.students = prevMentor.students.filter(id => id.toString() !== studentId);
      await prevMentor.save();
    }

    mentor.students.push(studentId);
    await mentor.save();

    student.mentor = mentorId;
    await student.save();

    res.json({ message: 'Mentor assigned to student successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Implementation for fetching the previously assigned mentor for a student
app.get('/api/students/:studentId/assigned-mentor', async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findById(studentId).populate('mentor');

    if (!student) {
      return res.status(404).json({ error: 'Student not found' });
    }

    res.json({ mentor: student.mentor });
  } catch (error) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
