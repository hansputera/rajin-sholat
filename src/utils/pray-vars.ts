import type { PrayVars } from "../types";

export enum Angles {
    Fajr = 18,
    Isha = 18,
}

export const getPrayVars = (julian: number): PrayVars => {
    const d = julian - 2451545.0;
    const g = 357.529 + 0.98560028 * d;
    const q = 280.459 + 0.98564736 * d;
    const L = q + 1.915 * Math.sin(g) + 0.020 * Math.sin(2*g);
    const R = 1.00014 - 0.01671 * Math.cos(g) - 0.00014 * Math.cos(2*g);
    const e = 23.439 - 0.00000036* d;

    const RA = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)) / 15;
    const D = Math.asin(Math.sin(e) * Math.sin(L));
    const equT = q / 15 - RA;

    return {
        d,
        g,
        q,
        L,
        R,
        e,
        RA,
        D,
        equT,
    }
}
