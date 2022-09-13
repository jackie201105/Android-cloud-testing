/**
The server.js is used to listen to a port to receive requests from the front-end
*/

// Initialize classes related to CORS, express
const cors = require("cors");
const express = require("express");
const app = express();

// the root directory of the back-end's source code
global.__basedir = __dirname;
// the directory for saving Android apps uploaded from the front-end
global.__uploadDir = __basedir + "/resources/static/assets/uploads/";

// CORS polices
var corsOptions = {
  origin: "http://localhost:3000"
};

app.use(cors(corsOptions));

// Initialize the route pahts
const initRoutes = require("./src/routes");
app.use(express.urlencoded({ extended: true }));
initRoutes(app);

let port = 8080;
// Start listening the port
app.listen(port, () => {
  console.log(`Running at localhost:${port}`);
});
