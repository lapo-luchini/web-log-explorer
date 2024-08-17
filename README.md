# Web Based Log Explorer

To preview this project locally, run `npm run preview`.

To build an `index.html` file for your tile based log, fill in the .env file with your log configuration and run `npm run build`.

When running locally, all requests to the selected log are made through a local proxy server which adds a CORS header to the response.

When running in production, if the `index.html` is located at a path on the same domain as the monitoring URL, then no changes are needed. If the file is located on a seperate domain, the log needs to be modified to allow cross site requests fron the seperate domain.