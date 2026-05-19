# Backlog — credentials needed (Apply Pass 5)

| Endpoint | Provider | Required env vars |
|---|---|---|
| `POST /api/integrations/notifications/email` | SMTP | `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `EMAIL_FROM` |
| `POST /api/integrations/notifications/sms` | Twilio | `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` |
| `GET /api/integrations/jobs/linkedin` | LinkedIn Jobs | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET`, `LINKEDIN_ACCESS_TOKEN` |
| `GET /api/integrations/jobs/indeed` | Indeed Publisher | `INDEED_PUBLISHER_ID`, `INDEED_API_KEY` |
| `GET /api/integrations/learning/coursera` | Coursera Catalog | `COURSERA_API_KEY` |

When set, the routes still require their respective SDK / outbound HTTP wiring;
no new dependencies were added in this pass.
