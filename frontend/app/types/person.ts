import {Attributes, ID} from "@/app/types/common";

export interface Person {
    id: ID;
    name: string;
    email: string;
    occupation: string;
    birthdate: string;
    attributes: Attributes;
}
