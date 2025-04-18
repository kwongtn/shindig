import axios from "axios";
import { initializeApp } from "firebase-admin/app";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { defineSecret } from "firebase-functions/params";
import { auth } from "firebase-functions/v1";
import { onRequest } from "firebase-functions/v2/https";
import ical from "ical-generator";

import { GoogleGenerativeAI } from "@google/generative-ai";
import {
    onDocumentCreated,
    onDocumentUpdated,
} from "firebase-functions/v2/firestore";
import { IEvent } from "../../app/src/app/types";
import { luma, meetup } from "./customScrapers/events";
import { sendDiscordWebhook } from "./events/onCreateSendWebhook";
import { extractDomain } from "./utils";

const GEMINI_API_KEY = defineSecret("GEMINI_API_KEY");

initializeApp();

interface UserFirestoreInitialData {
    // TODO: To decide what to record, as we are privacy oriented
    // Hence we record as less information as possible
    uid: string;
    email: string;
    displayName: string;
    createdAt: FieldValue;
}

export const createUserFirestoreEntry = auth
    .user()
    .onCreate(async (user: UserRecord) => {
        const uid = user.uid;
        const userFirestoreData: UserFirestoreInitialData = {
            uid,
            email: user.email as string,
            displayName: user.displayName as string,
            createdAt: FieldValue.serverTimestamp(),
        };

        await getFirestore()
            .collection("users")
            .doc(uid)
            .set(userFirestoreData);
    });

export const updateAdminToken = onDocumentUpdated(
    "users/{docId}",
    async (event) => {
        if (!event.data) {
            return;
        }

        const newData = event.data.after;

        return getAuth()
            .setCustomUserClaims(newData.id, newData.get("claims") ?? {})
            .then(() => {
                getAuth()
                    .listUsers()
                    .then((data) => {
                        data.users
                            .filter((val) => {
                                return val.uid === newData.id;
                            })
                            .forEach((val) => {
                                console.log(val.uid, val.customClaims);
                            });
                    });
            });
    }
);

const MODEL_NAME = "gemini-2.0-flash-001";

export const scrapeWebpage = onRequest(
    {
        secrets: ["GEMINI_API_KEY"],
        cors: true,
    },
    async (req, res) => {
        const url = req.body.data.url as string;
        const scrapeType = req.body.data.scrapeType as string;

        if (!url) {
            res.status(400).send("Please provide a URL as a query parameter.");
            return;
        }

        const domain = extractDomain(url);
        let responseData: Object = {};

        try {
            const response = await axios.get(url);
            const html = response.data;

            let prompt: string = "";
            if (scrapeType === "events") {
                let format: string = `{
                        "title": string,
                        "startTime": Date,
                        "endTime": Date,
                        "description": string,
                        "bannerUri": string,
                    }`;

                try {
                    let res = { data: {}, promptOutputFormat: "" };
                    if (domain === "lu.ma") {
                        res = luma(html);

                        responseData = res.data;
                        format = res.promptOutputFormat;
                    } else if (domain === "meetup.com") {
                        res = meetup(html);

                        responseData = res.data;
                        format = res.promptOutputFormat;
                    }
                } catch (error) {
                    console.error(`Error scraping ${domain}: ${error}`);
                }

                if (format) {
                    prompt = `Extract content such that we know what the event is about. Do not change any words. Convert relevant content into markdown for display in webpages. Use the following format:
                        ${format}
                    `;
                }
            } else {
                throw new Error(`Invalid scrape type: ${scrapeType}`);
            }

            // console.log(prompt);

            if (prompt) {
                const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
                const model = genAI.getGenerativeModel({
                    model: MODEL_NAME,
                    generationConfig: {
                        responseMimeType: "application/json",
                    },
                });

                const result = await model.generateContent(
                    `${prompt}\n---\n${html}`
                );
                if (
                    !result.response.candidates ||
                    result.response.candidates.length === 0
                ) {
                    res.status(500).send("No candidates returned from Gemini.");
                    return;
                }

                let text: any = "";
                try {
                    text = JSON.parse(
                        result.response.candidates[0].content.parts[0].text ??
                            "{}"
                    );

                    if (text instanceof Array) {
                        text = text[0];
                    }

                    responseData = {
                        ...responseData,
                        ...text,
                    };
                } catch (error) {
                    console.error("Response not in expected format: ", error);
                    res.status(500).send(
                        `Response not in expected format: ${error}`
                    );
                }
            }

            res.status(200).json({
                data: responseData,
            });
        } catch (error: any) {
            console.error(error);
            res.status(500).send(`Error scraping ${url}: ${error}`);
        }
    }
);

export const calendar = onDocumentUpdated("events/{eventId}", async (event) => {
    const cal = ical({
        prodId: {
            company: "KwongTN",
            product: "Shindig-IT",
            language: "en",
        },
        name: "Shindig-IT Calendar",
        timezone: "Asia/Kuala_Lumpur",
        url: "https://shindig-it.kwongtn.xyz",
        ttl: 60 * 60 * 24,
    });

    const events = await getFirestore()
        .collection("events")
        .where("isApproved", "==", true)
        .get();

    events.forEach((doc) => {
        const eventData = doc.data() as IEvent;

        cal.createEvent({
            id: eventData.id,
            start: eventData.startDatetime.toDate(),
            end: eventData.endDatetime?.toDate(),
            summary: eventData.title,
            description: eventData.description,
            // location: eventData.location,
            url: eventData.eventLinks[0],
        });
    });

    // console.log(cal.toString());

    const bucket = getStorage().bucket();
    const file = bucket.file("calendar.ics");

    await file.save(cal.toString(), {
        contentType: "text/calendar",
        public: true,
    });

    console.log("Calendar updated successfully!");
});

export const onEventDocumentCreated = onDocumentCreated(
    "events/{eventId}",
    async (event) => {
        await sendDiscordWebhook(event);
    }
);
