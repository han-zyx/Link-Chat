// Connect to server automatically
const ws = new WebSocket(`ws://${location.host}`);

ws.onmessage = event => {
    const msg = JSON.parse(event.data);
    const messagesDiv = document.getElementById("messages");

    if (msg.type === "message") {
        messagesDiv.innerHTML += `<div class="message"><b>[${msg.time}]</b> ${msg.text}</div>`;
    } 
    else if (msg.type === "file") {
        messagesDiv.innerHTML += `
            <div class="message">
                <b>[${msg.time}] File:</b> 
                <a href="${msg.url}" download>${msg.fileName}</a>
            </div>`;
    }

    messagesDiv.scrollTop = messagesDiv.scrollHeight;
};

function sendMessage() {
    const input = document.getElementById("messageInput");
    if (!input.value.trim()) return;

    ws.send(JSON.stringify({ text: input.value }));
    input.value = "";
}

function sendFile() {
    const fileInput = document.getElementById("fileInput");
    if (fileInput.files.length === 0) return;

    const formData = new FormData();
    formData.append("file", fileInput.files[0]);

    fetch("/upload", {
        method: "POST",
        body: formData
    });

    fileInput.value = "";
}
