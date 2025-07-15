const app = require("./app");
const logger = require("./utils/logger");
const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
    logger.app("info", `Server started successfully on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || "development",
    });
});

server.on("error", (error) => {
    logger.app("error", "Server error occurred", {
        error: error.message,
        stack: error.stack,
        port: PORT,
    });
});

server.on("close", () => {
    logger.app("info", "Server shutting down");
});
