# Haigen's optional language-model brain

The game works offline with its existing adaptive local mind. This optional gateway gives Haigen state-grounded conversation and advisory autonomous job selection using a locally hosted Ollama model. It does not execute code, move the player directly, change inventory or override survival rules.

## Setup
1. Install Ollama on a computer you control and pull a model suitable for that computer, e.g. `ollama pull llama3.2:3b`. Start Ollama and leave its default local API running at 127.0.0.1:11434.
2. Set HAIGEN_MODEL to the installed model name and HAIGEN_TOKEN to a private random token at least 32 characters long (Python: `python -c "import secrets; print(secrets.token_urlsafe(32))"`). Do not commit the token. Optional HAIGEN_ORIGIN defaults to https://astravalealive.github.io.
3. Run `python brain/haigen_gateway.py` in that environment. It binds only to 127.0.0.1:8765.
4. To access the gateway from iPad Safari on the HTTPS GitHub Pages build, configure a private HTTPS reverse proxy to the gateway. Do not expose Ollama itself. Limit incoming request size, set timeouts and use a trusted TLS certificate. The gateway already checks the exact allowed web origin, requires bearer authentication, serializes model requests, and rate limits requests. A publicly accessible proxy still requires monitoring and appropriate network controls.
5. In the game's Talk to Haigen panel, choose Configure private AI brain, enter the full HTTPS endpoint ending in /brain and the private gateway token. The browser holds those settings in memory only; re-enter them after a reload. Blank endpoint disables the feature.

The configured endpoint receives selected fictional game state and recent conversation text, so only use a trusted endpoint and avoid including personal information in game chats. No model requests are made before configuration. No keys are stored in source or the saved game.

## Acceptance checks
- Without configuring a gateway, conversation and autonomy continue to work locally.
- With a gateway configured, ask Haigen about his ambition; check the panel status becomes Language model responding.
- Enable autonomy with full health, energy and food. At a new job selection, the model may propose an eligible job; a later selection can use the proposal only while Haigen is healthy and the job is still eligible. Model failure, invalid replies, interruption or unavailability must not block ordinary gameplay.
- Stop the gateway, ask a question, and verify local fallback.
- Verify that the gateway rejects missing authorization, wrong origin and invalid job names.

The gateway and browser integration must be tested together before considering the model-backed brain operational. No external hosting or model installation is provided by GitHub Pages.
