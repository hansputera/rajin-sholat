import { julianEpoch } from "../constants/julian";

export const nowToJulian = (unixNow = Date.now()): number => {
    return (unixNow / 86400000) + julianEpoch;
}
