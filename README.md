# Simple GPT Chat

A minimal chat app that sends your messages (and optionally an attached file) to the OpenAI Chat Completions API and shows the response. Supports drag-and-drop file uploads.

## 1. Install

```
git clone https://github.com/DanZlotnikov/api_app_2.git
cd api_app_2
npm install
```

## 2. Get an OpenAI API key

1. Go to the [OpenAI API keys page](https://platform.openai.com/api-keys) (sign up or log in first).
2. Click **Create new secret key**, name it, and copy the value — it starts with `sk-` and is only shown once.
3. Make sure the account/project it belongs to has billing set up, or requests will fail.

## 3. Configure your environment

Copy the example env file and fill in your key:

```
cp .env.example .env
```

Edit `.env`:

```
OPENAI_API_KEY=sk-your-key-here
PORT=3000
```

`.env` is gitignored — your key never gets committed. Never paste it into code or share it publicly.

## 4. (Optional) Connect to the AI Cost Review gateway

This app can route its OpenAI calls through [AI Cost Review](https://gateway.danzlotnikov.com) to track usage/cost. It's entirely optional — the app works identically without it.

1. Sign up at [gateway.danzlotnikov.com](https://gateway.danzlotnikov.com) and grab your gateway key (looks like `aicr_live_...`).
2. Add it to your `.env`:
   ```
   AICR_GATEWAY_KEY=aicr_live_your-key-here
   ```
3. That's it — when this variable is set, requests are automatically routed through the gateway with your real OpenAI key still used for authentication. Leave it blank (or remove the line) to call OpenAI directly instead.

## 5. Run it

```
npm start
```

Open [http://localhost:3000](http://localhost:3000) (or whatever `PORT` you set) in your browser.

## Notes

- Text-based file attachments (`.txt`, `.md`, `.csv`, `.json`, code files, etc.) have their content included in the request to the model. Other file types are noted but not read.
- Max upload size is 5 MB; attached text is truncated to ~20,000 characters.
