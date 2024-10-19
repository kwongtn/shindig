import { DocumentReference, Timestamp } from "@angular/fire/firestore";

export interface ILocation {
    name: string;
    coordinates: {
        latitude: number;
        longitude: number;
    };
}

export interface ITag {
    name: string;
    description: string;
    fontColor: string;
    backgroundColor: string;
}

export interface IUser {
    uid: string;
    email: string;
    displayName: string | null;
    createdAt: Date;
}

export interface IOrganizer {
    name: string;
    subtitle?: string;
    profilePictureUri?: string;
    bannerUri?: string;
    officialPageUrls: string[];
    description: string;

    // This is only used for deciding who can edit/delete stuff. Not for public display.
    leaders: IUser[];
    commitees: IUser[];
    subscribers: IUser[];

    isInactive?: boolean;

    createdAt: Date;
    updatedAt: Date;
}

export interface IEvent {
    id: string;
    title: string;
    subtitle?: string;
    description: string;

    startDatetime: Timestamp;
    endDatetime: Timestamp;
    eventLinks: string[];
    organizerIds: string[];
    bannerUri?: string;
    locationId: string;

    
    tagIds: string[];
    isWalkInAvailable: boolean;
    isConfirmed: boolean;
    isPaid: boolean;
    isApproved?: boolean;

    authorId: DocumentReference;

    createdAt: Timestamp;
    updatedAt: Timestamp;
}
