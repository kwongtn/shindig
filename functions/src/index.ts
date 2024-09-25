import { initializeApp } from "firebase-admin/app";
import { FieldValue, getFirestore } from "firebase-admin/firestore";
import * as functions from "firebase-functions";

initializeApp()


interface UserFirestoreInitialData {
    // TODO: To decide what to record, as we are privacy oriented
    // Hence we record as less information as possible
    uid: string;
    email: string;
    displayName: string;
    createdAt: FieldValue;
}

export const createUserFirestoreEntry = functions.auth.user().onCreate(
    async (user) => {
        const uid = user.uid;
        const userFirestoreData: UserFirestoreInitialData = {
            uid,
            email: user.email as string,
            displayName: user.displayName as string,
            createdAt: FieldValue.serverTimestamp(),
        };

        await getFirestore().collection('users').doc(uid).set(userFirestoreData);
    }
);
