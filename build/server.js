"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const promises_1 = require("fs/promises");
const net_1 = require("net");
const server = new net_1.Server({
    noDelay: true,
});
server.on("connection", socket => {
    console.log(`Connection from ${socket.remoteAddress}`);
    socket.on("data", data => {
        if (data.length < 7) {
            socket.write(createResponseBuffer(400, "p(\"Error: 400 Bad Request\")"));
            socket.end();
            return;
        }
        console.log("Buffer:", data);
        handleRequest(socket, data).then(() => socket.end());
    });
});
async function handleRequest(socket, requestBuffer) {
    // Request Header:
    // <1:method> <2:path_len> <path_len:path> <4:content_length>
    const method = requestBuffer.readUInt8(0);
    const pathLength = requestBuffer.readUInt16BE(1);
    const path = requestBuffer.toString("utf8", 3, 3 + pathLength);
    const contentLength = requestBuffer.readUInt32BE(3 + pathLength);
    const content = requestBuffer.toString("utf8", 3 + pathLength + 4);
    console.log(`Received request: ${method} ${path}`);
    if (method !== 0) {
        socket.write(createResponseBuffer(405, "Method Not Allowed"));
        return;
    }
    const pageSource = await (0, promises_1.readFile)("page.yap", "utf8");
    socket.write(createResponseBuffer(200, pageSource));
}
function createResponseBuffer(statusCode, content) {
    // Response Header:
    // <2:status_code> <4:content_length>
    const encoder = new TextEncoder();
    const contentArray = encoder.encode(content);
    const responseBuffer = Buffer.alloc(6 + contentArray.byteLength);
    responseBuffer.writeUInt16BE(statusCode, 0);
    responseBuffer.writeUInt32BE(contentArray.byteLength, 2);
    responseBuffer.write(content, 6);
    return responseBuffer;
}
server.listen(5713, undefined, undefined, () => {
    console.log("Server is listening on port 5713");
});
