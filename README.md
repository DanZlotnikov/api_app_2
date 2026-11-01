# Simple GPT Chat

A minimal chat app that sends your messages (and optionally an attached text file) to the OpenAI Chat Completions API and shows the response.

## Setup

1. Install dependencies:
   ```
   npm install
   ```
2. Copy `.env.example` to `.env` and add your OpenAI API key:
   ```
   cp .env.example .env
   ```
   Then edit `.env`:
   ```
   OPENAI_API_KEY=sk-your-key-here
   PORT=3000
   ```
3. Start the server:
   ```
   npm start
   ```
4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Notes

- Supported file attachments are read as plain text (`.txt`, `.md`, `.csv`, `.json`, code files, etc.) and included in the request to the model. Other file types are noted but not read.
- Max upload size is 5 MB; attached text is truncated to ~20,000 characters.
- `.env` is gitignored — never commit your API key.
