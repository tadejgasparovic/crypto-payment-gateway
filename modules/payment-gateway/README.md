# Payment gateway
This is the primary gateway REST API every other service talks to (incuding 3rd party services).

## Cron jobs
The gateway provides multiple cron jobs required for normal operation of the service.
All crons can be configured in the config and started by running `src/jobs/index.js`.