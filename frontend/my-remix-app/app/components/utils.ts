import axios from "axios";
import { atom } from "jotai";

export const authAtom = atom<User | undefined>(undefined);

export const api = axios.create({
    baseURL: "http://10.77.113.59:5000/",
    withCredentials: true
});

export interface User {
    email: string,
    name: string,
    user_type: string
}
