import { EventEmitter } from "node:events";
import { Writable } from "node:stream";

export function dispatchRequest(handler, { url = "/", method = "GET", headers = {}, body = "" } = {}) {
  return new Promise((resolve, reject) => {
    const req = new EventEmitter();
    req.url = url;
    req.method = method;
    req.headers = { host: "localhost", ...headers };

    const responseHeaders = {};
    let statusCode = 200;
    const chunks = [];

    const res = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        callback();
      }
    });

    res.headersSent = false;

    res.setHeader = (key, val) => {
      responseHeaders[key.toLowerCase()] = String(val);
    };

    res.getHeader = (key) => responseHeaders[key.toLowerCase()];

    res.writeHead = (code, headersObj = {}) => {
      statusCode = code;
      res.headersSent = true;
      if (typeof headersObj === "object") {
        for (const [k, v] of Object.entries(headersObj)) {
          responseHeaders[k.toLowerCase()] = String(v);
        }
      }
      return res;
    };

    res.on("finish", () => {
      const resBody = Buffer.concat(chunks).toString("utf-8");
      resolve({
        statusCode,
        headers: responseHeaders,
        body: resBody
      });
    });

    res.on("error", reject);

    try {
      handler(req, res);
      if (body) {
        req.emit("data", Buffer.from(body));
      }
      req.emit("end");
    } catch (err) {
      reject(err);
    }
  });
}

