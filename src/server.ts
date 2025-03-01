import { readFile } from "fs/promises";
import { Server, Socket } from "net";
import { join, resolve } from "path";

const server = new Server({
    noDelay: true,
});

const BAD_REQUEST_CONTENT = Buffer.from(`p("Error: 400 Bad Request")`, "utf-8");
const NOT_FOUND_CONTENT = Buffer.from(`p("Error: 404 Not Found")`, "utf-8");
const METHOD_NOT_ALLOWED_CONTENT = Buffer.from(`p("Error: 405 Method Not Allowed")`, "utf-8");

server.on("connection", socket => {
    console.log(`Connection from ${socket.remoteAddress}`);

    socket.on("data", data => {
        if (data.length < 7) {
            socket.write(createResponseBuffer(400, BAD_REQUEST_CONTENT));
            socket.end();
            return;
        }

        console.log("Buffer:", data);
        handleRequest(socket, data).then(() => socket.end());
    });
});

async function handleRequest(socket: Socket, requestBuffer: Buffer) {
    // Request Header:
    // <1:method> <2:path_len> <path_len:path> <4:content_length>
    const method = requestBuffer.readUInt8(0);
    const pathLength = requestBuffer.readUInt16BE(1);
    const path = requestBuffer.toString("utf8", 3, 3 + pathLength);
    const contentLength = requestBuffer.readUInt32BE(3 + pathLength);
    const content = requestBuffer.toString("utf8", 3 + pathLength + 4);

    console.log(`Received request: ${method} ${path}`);
    if (method !== 0) {
        socket.write(createResponseBuffer(405, METHOD_NOT_ALLOWED_CONTENT));
        return;
    }

    if (path === "/") {
        const indexFile = await readFile("page.yap");
        socket.write(createResponseBuffer(200, indexFile));
        return;
    }

    const relativePath = join(module.path, path);
    console.log(module.path, relativePath);

    const bytes = await readFile(relativePath).catch(error => null);
    if (bytes === null) {
        socket.write(createResponseBuffer(404, NOT_FOUND_CONTENT));
        return;
    }

    socket.write(createResponseBuffer(200, bytes));
}

function createResponseBuffer(statusCode: number, content: Buffer): Buffer {
    // Response Header:
    // <2:status_code> <4:content_length>

    // const encoder = new TextEncoder();
    // const contentArray = encoder.encode(content);

    const responseBuffer = Buffer.alloc(6 + content.byteLength);
    responseBuffer.writeUInt16BE(statusCode, 0);
    responseBuffer.writeUInt32BE(content.byteLength, 2);
    responseBuffer.set(content, 6);

    return responseBuffer;
}

server.listen(5713, undefined, undefined, () => {
    console.log("Server is listening on port 5713");
});