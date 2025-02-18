import axios from "axios";
import { initializeApp } from "firebase-admin/app";
import { getAuth, UserRecord } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import { defineSecret } from "firebase-functions/params";
import { auth } from "firebase-functions/v1";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";
import { onRequest } from "firebase-functions/v2/https";

import { GoogleGenerativeAI } from "@google/generative-ai";

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
    },
    async (req, res) => {
        const url = req.body.data.url as string;

        if (!url) {
            res.status(400).send("Please provide a URL as a query parameter.");
            return;
        }

        try {
            const response = await axios.get(url);
            const html = response.data;

            const genAI = new GoogleGenerativeAI(GEMINI_API_KEY.value());
            const model = genAI.getGenerativeModel({
                model: MODEL_NAME,
                generationConfig: {
                    responseMimeType: "application/json",
                },
            });

            const prompt = `Extract content such that we know what the event is about. Do not change any words. Convert relevant content into markdown for display in webpages.
                Use the following format:
                {
                    "title": string,
                    "startTime": Date,
                    "endTime": Date,
                    "description": string,
                }
                `;

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

            try {
                const text =
                    result.response.candidates[0].content.parts[0].text;
                res.status(200).json({
                    data: text ? JSON.parse(text)[0] : undefined,
                });
            } catch (error) {
                console.error("Response not in expected format: ", error);
                res.status(500).send(
                    `Response not in expected format: ${error}`
                );
            }
        } catch (error: any) {
            console.error(error);
            res.status(500).send(`Error scraping ${url}: ${error}`);
        }
    }
);
