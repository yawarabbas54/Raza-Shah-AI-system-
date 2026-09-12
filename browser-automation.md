# Browser Automation — full skill
Browser automation is an integration boundary. Production deployments should use a dedicated browser worker such as Playwright with:
- domain allowlists
- action schemas
- timeouts
- screenshots/logs
- confirmation gates for submissions, purchases or account changes
Never allow arbitrary model-generated shell commands.
