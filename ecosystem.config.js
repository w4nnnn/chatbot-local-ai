module.exports = {
    apps: [
        {
            name: "chatbot-local-ai",
            script: "npm",
            args: "start",
            autorestart: true,
            watch: false,
            max_memory_restart: "1G",
            error_file: "./logs/err.log",
            out_file: "./logs/out.log",
            log_file: "./logs/combined.log",
            time: true,
        },
    ],
};
