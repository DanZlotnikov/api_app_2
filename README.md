# Simple GPT Chat

A minimal chat app that sends your messages (and optionally an attached file) to OpenAI and shows the response. Supports drag-and-drop file uploads.

## Install & run

```
git clone https://github.com/DanZlotnikov/api_app_2.git
cd api_app_2
npm install
```

### Get an OpenAI API key

1. Go to the [OpenAI API keys page](https://platform.openai.com/api-keys) (sign up or log in first).
2. Click **Create new secret key**, name it, and copy the value — it starts with `sk-` and is only shown once.
3. Make sure the account/project it belongs to has billing set up, or requests will fail.

### Add the key

```
cp .env.example .env
```

Open `.env` and paste your key in:

```
OPENAI_API_KEY=sk-your-key-here
PORT=3000
```

`.env` is gitignored, so your key never gets committed.

### Run it

```
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser. That's it — on a fresh clone, `npm install` + a valid `OPENAI_API_KEY` in `.env` is all it takes to get it running.

Usage is measured by the [AI Cost Review](https://gateway.danzlotnikov.com) gateway automatically — no extra setup needed, it's already wired in.

## Notes

- Text-based file attachments (`.txt`, `.md`, `.csv`, `.json`, code files, etc.) have their content included in the request to the model. Other file types are noted but not read.
- Max upload size is 5 MB; attached text is truncated to ~20,000 characters.
