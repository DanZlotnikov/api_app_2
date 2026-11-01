require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// File types we can safely read as plain text and hand to the model.
const TEXT_EXTENSIONS = new Set([
  '.txt', '.md', '.csv', '.json', '.js', '.ts', '.py', '.html', '.css',
  '.xml', '.yml', '.yaml', '.log', '.c', '.cpp', '.java', '.sh',
]);

const MAX_FILE_CHARS = 20000;

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

app.post('/api/chat', upload.single('file'), async (req, res) => {
  try {
    if (!OPENAI_API_KEY) {
      return res.status(500).json({ error: 'Server is missing OPENAI_API_KEY. Add it to the .env file and restart.' });
    }

    const message = (req.body.message || '').trim();
    const file = req.file;

    if (!message && !file) {
      return res.status(400).json({ error: 'Please enter a message or attach a file.' });
    }

    let userContent = message || 'Please take a look at the attached file.';

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      if (TEXT_EXTENSIONS.has(ext)) {
        let text = file.buffer.toString('utf-8');
        let truncated = false;
        if (text.length > MAX_FILE_CHARS) {
          text = text.slice(0, MAX_FILE_CHARS);
          truncated = true;
        }
        userContent += `\n\n--- Attached file: ${file.originalname} ---\n${text}${truncated ? '\n...(truncated)' : ''}`;
      } else {
        userContent += `\n\n(Note: a file named "${file.originalname}" was attached, but its type is not supported for text extraction in this app, so its contents could not be included.)`;
      }
    }

    const response = await fetch('https://gateway.danzlotnikov.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        "x-aicr-key": "aicr_live_SAtv9JN5zlMoVEUq42Yho7OMzXCUzLmx45ljLj",
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant.' },
          { role: 'user', content: userContent },
        ],
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      const errMessage = data?.error?.message || 'Request to OpenAI failed.';
      return res.status(response.status).json({ error: errMessage });
    }

    const reply = data.choices?.[0]?.message?.content || '(No response received.)';
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Something went wrong on the server.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
