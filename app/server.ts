import express from "express";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { APP_BASE_HREF } from "@angular/common";
import { renderApplication } from "@angular/platform-server";

import bootstrap from "./src/main.server";

// The Express app is exported so that it can be used by serverless Functions.
export function app(): express.Express {
    const server = express();
    const serverDistFolder = dirname(fileURLToPath(import.meta.url));
    const browserDistFolder = resolve(serverDistFolder, "../browser");
    const indexHtml = join(serverDistFolder, "index.server.html");

    server.set("view engine", "html");
    server.set("views", browserDistFolder);

    // Example Express Rest API endpoints
    // server.get('/api/**', (req, res) => { });
    // Serve static files from /browser
    server.get(
        "**",
        express.static(browserDistFolder, {
            maxAge: "1y",
            index: "index.html",
        })
    );

    // Define public routes
    const publicRoutes = [
        "/",
        "/welcome",
        "/events",
        "/events/past",
        "/events/past/1",
        "/events/upcoming",
        "/events/upcoming/1",
        "/organizers",
        "/calendar",
        "/organizer",
    ];

    // All regular routes use the Angular engine
    server.get("**", (req, res, next) => {
        const { protocol, originalUrl, baseUrl, headers } = req;
        const url = req.originalUrl;

        if (publicRoutes.includes(url)) {
            renderApplication(bootstrap, {
                document: indexHtml,
                url: `${protocol}://${headers.host}${originalUrl}`,
                platformProviders: [
                    { provide: APP_BASE_HREF, useValue: baseUrl },
                ],
            })
                .then((html) => res.send(html))
                .catch((err) => next(err));
        } else {
            // Handle non-public routes (e.g., serve a 404 or redirect to login)
            res.status(404).send("Not Found");
        }
    });

    return server;
}

function run(): void {
    const port = process.env["PORT"] || 4000;

    // Start up the Node server
    const server = app();
    server.listen(port, () => {
        console.log(
            `Node Express server listening on http://localhost:${port}`
        );
    });
}

run();
