require('dotenv').config();

const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
});

// File types we read as plain text instead of sending as base64.
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

    const textPrompt = message || 'Please take a look at the attached file.';
    let userContent = textPrompt;

    if (file) {
      const ext = path.extname(file.originalname).toLowerCase();
      const mimetype = file.mimetype || 'application/octet-stream';

      if (TEXT_EXTENSIONS.has(ext) || mimetype.startsWith('text/')) {
        let text = file.buffer.toString('utf-8');
        let truncated = false;
        if (text.length > MAX_FILE_CHARS) {
          text = text.slice(0, MAX_FILE_CHARS);
          truncated = true;
        }
        userContent = `${textPrompt}\n\n--- Attached file: ${file.originalname} ---\n${text}${truncated ? '\n...(truncated)' : ''}`;
      } else {
        // Any other type OpenAI accepts (images, PDFs, audio, etc.) is sent as base64.
        const base64 = file.buffer.toString('base64');
        const dataUrl = `data:${mimetype};base64,${base64}`;

        if (mimetype.startsWith('image/')) {
          userContent = [
            { type: 'text', text: textPrompt },
            { type: 'image_url', image_url: { url: dataUrl } },
          ];
        } else {
          userContent = [
            { type: 'text', text: textPrompt },
            { type: 'file', file: { filename: file.originalname, file_data: dataUrl } },
          ];
        }
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

app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError && err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File is too large. Max size is 20 MB.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
