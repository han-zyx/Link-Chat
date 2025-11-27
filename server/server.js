const express = require("express");
const multer = require("multer");
const WebSocket = require("ws");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static client files
app.use(express.static(path.join(__dirname, "../client")));

// Storage for uploaded files
const storage = multer.diskStorage({
    destination: "./uploads/",
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    }
});
const upload = multer({ storage });

app.use("/files", express.static("./uploads"));

// Upload endpoint
app.post("/upload", upload.single("file"), (req, res) => {
    const fileURL = "/files/" + req.file.filename;

    // Broadcast file message
    broadcast({
        type: "file",
        fileName: req.file.originalname,
        url: fileURL,
        time: new Date().toLocaleTimeString()
    });

    res.json({ success: true, url: fileURL });
});

// WebSocket server
const server = app.listen(3000, () => {
    console.log("Server running on port 3000");
});

const wss = new WebSocket.Server({ server });

function broadcast(msg) {
    const data = JSON.stringify(msg);
    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on("connection", ws => {
    ws.on("message", msg => {
        msg = JSON.parse(msg);

        broadcast({
            type: "message",
            text: msg.text,
            time: new Date().toLocaleTimeString()
        });
    });
});
