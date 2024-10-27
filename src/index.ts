import {Hono} from 'hono';
import { nowToJulian } from './utils/now-to-julian';
import { getPrayVars } from './utils/pray-vars';
import { coordinates } from './constants/coordinates';
import { PrayTimes } from './structures/pray-times';
import { isValidTimeZone } from './utils/timezone-valid';

const app = new Hono();

app.get('/', (ctx) => ctx.text('Hello, World!'));
app.get('/julian', (ctx) => ctx.json({
    status: 'ok',
    data: nowToJulian(),
}));
app.get('/vars', (ctx) => ctx.json({
    status: 'ok',
    data: getPrayVars(Number.parseFloat(ctx.req.query('julian') ?? '0') ?? getPrayVars(nowToJulian())),
}));

app.get('/prayers', async ctx => {
    let long = Number.parseFloat(ctx.req.query('longitude') ?? '-');
    // let lat = Number.parseFloat(ctx.req.query('latitude') ?? '-');
    const timezone = ctx.req.query('timezone') ?? 'Asia/Makassar';

    if (Number.isNaN(long)) {
        long = coordinates.long;
    }

    if (timezone && !isValidTimeZone(timezone)) {
        return ctx.json({
            status: 'error',
            message: 'Invalid timezone.',
        });
    }

    const pray = new PrayTimes(timezone);
    const fajrAndIsha = pray.getFajrAndIsha(long);
    const sunriseAndSunset = pray.getSunriseAndSunset(long);

    const payload = {
        fajr: fajrAndIsha.fajr, // 1
        isha: fajrAndIsha.isha, // 7
        sunrise: sunriseAndSunset.sunrise, // 2
        sunset: sunriseAndSunset.sunset, // 5
        maghrib: pray.getMaghrib(long), // 6
        ashr: pray.getAshr(long), // 4
        midnight: pray.getMidnight(long), // 8
        dhuhr: pray.getDhuhr(long), // 3
        timezone,
    }

    console.log(payload)

    return ctx.json({
        status: 'ok',
        data: payload,
    });
});

export default app;