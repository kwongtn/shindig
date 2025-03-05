import axios from "axios";
import { getFirestore, QueryDocumentSnapshot } from "firebase-admin/firestore";

import { FirestoreEvent } from "firebase-functions/firestore";
import { IEvent } from "../../../app/src/app/types";

const moment = require("moment-timezone");

const DESCRIPTION_LENGTH = 512;
const TIMEZONE = "Asia/Kuala_Lumpur";

export async function sendDiscordWebhook(
    event: FirestoreEvent<
        QueryDocumentSnapshot | undefined,
        {
            eventId: string;
        }
    >
) {
    const db = getFirestore();
    const docRef = db.collection("meta").doc("private");
    const doc = await docRef.get();

    if (!doc.exists) {
        console.log("No such document!");
        return;
    }

    const webhookUrls = doc.data()?.eventWebhookUrls;

    if (!webhookUrls || webhookUrls.length === 0) {
        console.log("No webhook URLs found!");
        return;
    }

    const eventData = event.data?.data() as IEvent;
    if (!eventData) {
        console.log("No event data!");
        return;
    }

    if (eventData.startDatetime.toDate() < new Date()) {
        console.log("Event is in the past, not sending notification.");
        return;
    }

    for (const webhookUrlData of webhookUrls) {
        const webhookUrl = webhookUrlData.url;

        if (!webhookUrl) {
            console.log("Invalid webhook URL!");
            continue;
        }

        const message = {
            username: "Shindig-IT",
            embeds: [
                {
                    title: eventData.title,
                    description:
                        eventData.description.length > DESCRIPTION_LENGTH
                            ? eventData.description.slice(
                                  0,
                                  DESCRIPTION_LENGTH - 3
                              ) + "..."
                            : eventData.description.slice(
                                  0,
                                  DESCRIPTION_LENGTH
                              ),
                    url: eventData.eventLinks[0],
                    timestamp: new Date(
                        eventData.createdAt.toDate()
                    ).toISOString(),
                    fields: [
                        {
                            name: "DateTime",
                            value:
                                moment(eventData.startDatetime.toDate())
                                    .tz(TIMEZONE)
                                    .format("yyyy MMM DD HH:mm") +
                                " - " +
                                moment(eventData.endDatetime.toDate())
                                    .tz(TIMEZONE)
                                    .format("yyyy MMM DD HH:mm"),
                        },
                        {
                            name: "Tags",
                            value: [
                                eventData.isWalkInAvailable
                                    ? "🚶 - Walk-in Available"
                                    : "📝 - Registration Required",
                                eventData.isConfirmed
                                    ? "✅ - Confirmed"
                                    : "🤔 - Pending Confirmation",
                                eventData.isPaid
                                    ? "💸 - Paid Event"
                                    : "🤑 - Free Event",
                            ].join("\n"),
                        },
                        {
                            name: "Approval for site display",
                            value: eventData.isApproved ? "✅" : "❌",
                        },
                        // {
                        //     name: "Location",
                        //     value: eventData.locationId || "N/A",
                        // },
                    ],
                    image: eventData.bannerUri
                        ? {
                              url: eventData.bannerUri,
                          }
                        : undefined,
                    color: 0x0099ff,
                },
            ],
        };

        console.log(message);

        try {
            await axios.post(webhookUrl, message);
            console.log("Discord webhook sent successfully!");
        } catch (error) {
            console.error("Error sending Discord webhook:", error);
        }
    }
}
