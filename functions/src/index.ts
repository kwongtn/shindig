import { initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import { onDocumentUpdated } from "firebase-functions/v2/firestore";

initializeApp();

interface UserFirestoreInitialData {
    // TODO: To decide what to record, as we are privacy oriented
    // Hence we record as less information as possible
    uid: string;
    email: string;
    displayName: string;
    createdAt: FieldValue;
}

export const createUserFirestoreEntry = functions.auth
    .user()
    .onCreate(async (user) => {
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
