export function isValidTimeZone(tz: string): boolean {
    if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
        return false;
    }

    try {
        Intl.DateTimeFormat(undefined, {timeZone: tz});
        return true;
    }
    catch (ex) {
        return false;
    }
}