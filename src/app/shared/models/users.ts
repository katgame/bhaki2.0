import { Branch } from "./branch";

export interface Credentials {
    username: string;
    password: string;
    expiresInMins : number; // default to 60 minutes
}

// export interface User {
//     id: number;
//     firstName: string;
//     lastName: string;
//     maidenName?: string;
//     age: number;
//     gender: string;
//     email: string;
//     phone: string;
//     username: string;
//     password: string;
//     birthDate: string;
//     image: string;
//     bloodGroup?: string;
//     height?: number;
//     weight?: number;
//     eyeColor?: string;
//     hair: {
//         color: string;
//         type: string;
//     };
//     domain: string;
//     ip: string;
//     address: {
//         address: string;
//         city: string;
//         coordinates: {
//             lat: number;
//             lng: number;
//         };
//         postalCode: string;
//         state: string;
//     };
//     macAddress: string;
//     university: string;
//     bank: {
//         cardExpire: string;
//         cardNumber: string;
//         cardType: string;
//         currency: string;
//         iban: string;
//     };
//     company: {
//         address: {
//             address: string;
//             city: string;
//             coordinates: {
//                 lat: number;
//                 lng: number;
//             };
//             postalCode: string;
//             state: string;
//         };
//         department: string;
//         name: string;
//         title: string;
//     };
//     ein: string;
//     ssn: string;
//     userAgent: string;
// }

export interface UserDetails {
  user: Partial<User>;
  branch: Partial<Branch>;
  role: string[];
}


interface User {
  custom: null;
  id: string;
  userName: string;
  normalizedUserName: string;
  email: string;
  normalizedEmail: string;
  emailConfirmed: boolean;
  passwordHash: string;
  securityStamp: string;
  concurrencyStamp: string;
  phoneNumber: null;
  phoneNumberConfirmed: boolean;
  twoFactorEnabled: boolean;
  lockoutEnd: null;
  lockoutEnabled: boolean;
  accessFailedCount: number;
  name: string;
  surname: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateUserDetails {
  name: string;
  surname: string;
  email: string;
  phoneNumber: string;
  userName: string;
}