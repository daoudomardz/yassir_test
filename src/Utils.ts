import * as https from "https";
import * as http from "http";

export const getContent = function (
  options: string | https.RequestOptions | URL
): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(options, (response) => {
      if (response.statusCode < 200 || response.statusCode > 299) {
        reject(
          new Error("Failed to load page, status code: " + response.statusCode)
        );
      }
      const body = [];
      response.on("data", (chunk) => body.push(chunk));
      response.on("end", () => resolve(body.join("")));
    });
    request.on("error", (err) => reject(err));
  });
};
