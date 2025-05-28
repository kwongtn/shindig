import { Injectable } from "@angular/core";
import {
    Firestore,
    addDoc,
    collection,
    collectionData,
    doc,
    getDoc,
    getDocs,
    query,
    where,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";
import { ITag } from "../types";

@Injectable({
    providedIn: "root",
})
export class TagService {
    private tagsCollection;

    constructor(private firestore: Firestore) {
        this.tagsCollection = collection(this.firestore, "tags");
    }

    getAllTags(): Observable<ITag[]> {
        return collectionData(this.tagsCollection, {
            idField: "id",
        }) as Observable<ITag[]>;
    }

    async createTag(name: string, colorClass: string): Promise<ITag> {
        const newTag: Omit<ITag, "id"> = { name, colorClass };
        const docRef = await addDoc(this.tagsCollection, newTag);
        return { id: docRef.id, ...newTag } as ITag;
    }

    async getTagById(id: string): Promise<ITag | undefined> {
        const docRef = doc(this.firestore, "tags", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
            return {
                id: docSnap.id,
                ...(docSnap.data() as Omit<ITag, "id">),
            } as ITag;
        } else {
            return undefined;
        }
    }

    async getTagsByIds(ids: string[]): Promise<ITag[]> {
        if (ids.length === 0) {
            return [];
        }
        const q = query(this.tagsCollection, where("__name__", "in", ids));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(
            (doc) =>
                ({ id: doc.id, ...(doc.data() as Omit<ITag, "id">) } as ITag)
        );
    }
}
