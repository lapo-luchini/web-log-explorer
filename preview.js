import select from "@inquirer/select";
import { exec } from "child_process";
import http from "http";
import { stderr, stdout } from "process";

const logUrl = await select({
  message: "Select a log",
  choices: [
    {
      name: "Armored Witness Firmware Prod",
      value:
        "https://api.transparency.dev/armored-witness-firmware/prod/log/1/",
    },
    {
      name: "Armored Witness Firmware Dev",
      value: "https://api.transparency.dev/armored-witness-firmware/ci/log/4/",
    },
    {
      name: "Armory Drive Log",
      value:
        "https://raw.githubusercontent.com/f-secure-foundry/armory-drive-log/master/log/",
    },
    {
      name: "LVFS",
      value: "https://fwupd.org/ftlog/lvfs/",
    },
  ],
});

// Create an HTTP server
const server = http.createServer(async (req, res) => {
  try {
    // Forward the request to the target URL using the fetch API
    const targetResponse = await fetch(logUrl, {
      method: req.method,
      headers: req.headers,
    });

    // Get the response body as text
    const body = await targetResponse.text();

    // Set the response headers
    res.statusCode = targetResponse.status;
    res.setHeader(
      "Content-Type",
      targetResponse.headers.get("Content-Type") || "text/plain"
    );
    res.setHeader("Access-Control-Allow-Origin", "*");

    // Send the response body
    res.end(body);
  } catch (error) {
    // Handle any errors that occur during the request
    res.statusCode = 500;
    res.setHeader("Content-Type", "text/plain");
    res.end("Error occurred while processing the request.");
    console.error("Error:", error);
  }
});

// Listen on the specified port and hostname
const hostname = "localhost";
const port = 4174;
server.listen(port, hostname, () => {
  console.log(
    `Proxy server running at http://${hostname}:${port}/ to ${logUrl}`
  );
});

// Run the vite server
// const command = `LOG_URL=http://${hostname}:${port}/ npm run build && npm run preview`;
const command = `VITE_LOG_URL=http://${hostname}:${port}/ FORCE_COLOR=1 npm run build && FORCE_COLOR=1 npm run serve`;
const child = exec(command);
child.stdout.pipe(stdout);
child.stderr.pipe(stderr);
child.on("error", (error) => {
  console.error("Error:", error);
});
