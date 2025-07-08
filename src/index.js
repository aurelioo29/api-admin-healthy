const http = require("http");

const app = require("./app");

const setupDatabase = require("./utils/setupDatabase");

const port = process.env.PORT || 5000;

const server = http.createServer(app);

setupDatabase().then(() => {
  server.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
});
