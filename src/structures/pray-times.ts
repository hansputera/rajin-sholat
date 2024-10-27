import dayjs from "dayjs";
import * as mathjs from 'mathjs';
import utc from 'dayjs/plugin/utc';
import timeZone from 'dayjs/plugin/timezone';
import type { PrayVars } from "../types";
import { Angles, getPrayVars } from "../utils/pray-vars";
import { nowToJulian } from "../utils/now-to-julian";

export class PrayTimes {
    public date!: dayjs.Dayjs;

    constructor(private readonly timezone: string) {
        dayjs.extend(utc);
        dayjs.extend(timeZone);

        this.date = dayjs(Date.now()).tz(this.timezone);
    }

    public getDhuhr(longitude: number) {
        return mathjs.add(12, this.date.utcOffset(), mathjs.subtract(mathjs.divide(longitude, 15), this.vars.equT));
    }

    public getSunriseAndSunset(longitude: number, heightObs?: number, vars?: PrayVars): {
        sunset: mathjs.MathType;
        sunrise: mathjs.MathType;
    } {
        const dhuhr = this.getDhuhr(longitude);

        return {
            sunrise: mathjs.subtract(dhuhr, this.T(this.vars, heightObs ? mathjs.multiply(0.0347, mathjs.sqrt(heightObs) as number) : 0.833)),
            sunset: mathjs.add(dhuhr, this.T(this.vars, heightObs ? mathjs.multiply(0.0347, mathjs.sqrt(heightObs)) as number : 0.833)),
        }
    }

    public getFajrAndIsha(longitude: number): {
        fajr: mathjs.MathType;
        isha: mathjs.MathType;
    } {
        const dhuhr = this.getDhuhr(longitude);
        return {
            fajr: mathjs.subtract(dhuhr, this.T(this.vars, Angles.Fajr)),
            isha: mathjs.add(dhuhr, this.T(this.vars, Angles.Isha)),
        }
    }

    public getAshr(longitude: number) {
        const dhuhr = this.getDhuhr(longitude);
        return mathjs.add(dhuhr, this.A(this.vars, 2));
    }

    public getMaghrib(longitude: number) {
        return mathjs.add(this.getDhuhr(longitude), this.T(this.vars, 4));
    }

    public getMidnight(longitude: number) {
        const nextDay = this.date.clone().add(1, 'day');
        const nextJd = nowToJulian(nextDay.unix());

        const newVars = getPrayVars(nextJd);
        const currentSunrise = this.getSunriseAndSunset(longitude);
        const nextSunrise = this.getSunriseAndSunset(longitude, undefined, newVars);

        return mathjs.multiply(mathjs.divide(1, 2), mathjs.subtract(nextSunrise.sunrise, currentSunrise.sunset));
    }

    protected T(vars: PrayVars, alpha: number) {
        return mathjs.multiply(mathjs.divide(1, 15), mathjs.acos(
            mathjs.divide(
                -mathjs.sin(alpha) - mathjs.multiply(mathjs.sin(vars.L), mathjs.sin(vars.D)),
                mathjs.multiply(mathjs.cos(vars.L), mathjs.cos(vars.D)),
            )
        ));
    }

    protected A(vars: PrayVars, t: number): mathjs.MathType {
        return mathjs.multiply(mathjs.divide(1, 15), mathjs.acos(
            mathjs.divide(
                mathjs.sin(
                    mathjs.acot(
                        mathjs.subtract(
                            mathjs.add(t, mathjs.tan(mathjs.subtract(vars.L, vars.D))),
                            mathjs.multiply(mathjs.sin(vars.L), mathjs.sin(vars.D)),
                        ),
                    )
                ),
                mathjs.multiply(mathjs.cos(vars.L), mathjs.cos(vars.D)),
            )
        ));
    }

    protected get vars(): PrayVars {
        return getPrayVars(nowToJulian(this.date.unix()));
    }
}