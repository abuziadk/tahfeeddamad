// server.js
const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse');

const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage });

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

app.post('/upload', upload.single('pdfFile'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('يرجى اختيار ملف PDF.');
    }
    res.send('تم رفع الملف بنجاح.');
});

app.post('/search', async (req, res) => {
    const studentId = req.body.studentId;
    const files = fs.readdirSync('uploads');

    for (const file of files) {
        const dataBuffer = fs.readFileSync(path.join('uploads', file));
        const pdfData = await pdfParse(dataBuffer);

        if (pdfData.text.includes(studentId)) {
            return res.send({ filePath: `/uploads/${file}` });
        }
    }

    res.status(404).send({ message: 'لم يتم العثور على الشهادة.' });
});

// تقديم ملفات PDF من مجلد uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
