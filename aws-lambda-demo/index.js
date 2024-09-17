/* handler.js */
const https = require("https");
const { trace } = require("@opentelemetry/api");

const tracer = trace.getTracer("test", "0.1");
function getRequest() {
  const url = "https://opentelemetry.io/";

  return new Promise((resolve, reject) => {
    const req = https.get(url, (res) => {
      resolve(res.statusCode);
    });

    req.on("error", (err) => {
      reject(new Error(err));
    });
  });
}

exports.handler = async (event) => {
  try {
    let result = await getRequest();
    result = await getRequest();
    const parentSpan = tracer.startSpan("main");
    parentSpan.addEvent("ADDING A CUSTOM EVENT");
    parentSpan.setAttribute("FOO", "BAR");
    parentSpan.end();
    //await provider.forceFlush()
    return {
      statusCode: result,
    };
  } catch (error) {
    return {
      statusCode: 400,
      body: error.message,
    };
  } finally {
    console.log("flush started")

  }
};
