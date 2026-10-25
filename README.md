# CarScan

A mobile-friendly car photo identifier and personal collection app. Upload a photo and the AI estimates make/model/year/trim, then adds a collectible card. No manual car details are required. Non-car photos return a clear “No car detected” message.

## Important

The app needs a hosted Node.js server and an OpenAI API key to identify photos. The key must be configured privately as the `OPENAI_API_KEY` server environment variable; never put it in the browser code. API usage may cost money. The collection is saved in the current browser/device, not synced between devices.

## Deploy with Render

1. Put this project in a GitHub repository.
2. In Render, create a new **Blueprint** and select that repository. Render will read `render.yaml`.
3. In the service's Environment settings, set `OPENAI_API_KEY` to your own API key and deploy.
4. Open the generated website URL on your phone.

The `/api/health` endpoint confirms whether the server is running and whether an API key is configured (it never reveals the key).

## Local development

Requires Node.js 18+. Run `npm install`, set `OPENAI_API_KEY` in the server environment, then run `npm start` and visit `http://localhost:3000`.
