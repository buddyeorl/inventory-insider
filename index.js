import express from 'express';
import fetch from 'node-fetch';
import request from 'request';
import cheerio from 'cheerio';
import fs from 'fs';
import { faker } from '@faker-js/faker';

const PORT = process.env.PORT || 3001;
var shouldStop = false;
var isRunning = false;
var schedule = {
    isRunning: false,
    start: 7,
    end: 17
}
//initialize app
const app = express();
app.use(express.json());
app.use(express.static('public'))

let currentUrlIndex = -1;
const url = [
    'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/#|',
    'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/small-leather-goods/#|'
];

const targetList = [
    "evelyne 16 amazone",
    "rodeo pegase pm",
    "lindy mini",
    "constance long to go"
]

async function sendSlackMessage(message, workspace, channelId, slackToken) {
    const body = {
        text: message
    };
    const headers = {
        'Content-Type': 'application/json'
    };
    try {
        const result = await fetch(`https://hooks.slack.com/services/${workspace}/${channelId}/${slackToken}`, {
            method: 'POST',
            mode: 'no-cors',
            cache: 'no-cache',
            credentials: 'same-origin',
            redirect: 'follow',
            referrerPolicy: 'no-referrer',
            headers: headers,
            body: JSON.stringify(body)
        });
        const data = await result;
        if (data.error) {
            console.error(data.error);
        } else {
            console.log(`Successfully sent message to ${channelId}`);
        }
    } catch (error) {
        console.error(error);
    }
}

// function generateChromeVersion() {
//     const majorVersion = Math.floor(Math.random() * 89) + 1;
//     const minorVersion = Math.floor(Math.random() * 10);
//     const buildVersion = Math.floor(Math.random() * 10000);
//     const patchVersion = Math.floor(Math.random() * 100);
//     return `Chrome/${majorVersion}.${minorVersion}.${buildVersion}.${patchVersion}`;
// }

function generateRandomHeaders() {
    let browserList = ['Chrome', 'Firefox', 'Edge', 'Safari', 'Opera'];
    let randomBrowser = browserList[Math.floor(Math.random() * browserList.length)];

    let version;
    switch (randomBrowser) {
        case 'Chrome':
            version = Math.floor(Math.random() * (91 - 80) + 80) + '.' + Math.floor(Math.random() * (3 - 0) + 0) + '.' + Math.floor(Math.random() * (3000 - 0) + 0);
            break;
        case 'Firefox':
            version = Math.floor(Math.random() * (90 - 60) + 60) + '.' + Math.floor(Math.random() * (1 - 0) + 0);
            break;
        case 'Edge':
            version = Math.floor(Math.random() * (91 - 80) + 80) + '.0.0';
            break;
        case 'Safari':
            version = Math.floor(Math.random() * (15 - 12) + 12) + '.0.0';
            break;
        case 'Opera':
            version = Math.floor(Math.random() * (90 - 60) + 60) + '.' + Math.floor(Math.random() * (1 - 0) + 0);
            break;
    }

    let headers = {
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) ${randomBrowser}/${version} Safari/537.36`,
        'Accept-Language': 'en-US,en;q=0.9',
        // 'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        // 'Pragma': 'no-cache',
        'Cache-Control': 'no-cache'
    };

    return headers;
}


function crawlWebsite() {
    console.log('starting to crawl', url[currentUrlIndex])
    //const headers = generateRandomHeaders();
    const headers = createHeaders()
    console.log(headers)
    return new Promise((res, rej) => {
        // make an HTTP request to the website
        request(url[currentUrlIndex], {
            headers

        }, async function (error, response, html) {
            console.log('request recevied', response.statusCode)
            await writeToFile('./logs/last.json', [{ code: response.statusCode, time: new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) }]);
            if (!error && response.statusCode == 200) {
                // parse the HTML of the website
                const $ = cheerio.load(html);

                const links = $('a').filter((i, el) => {
                    let currentElText = $(el).text().toLowerCase();
                    let found = targetList.some(target => currentElText.includes(target))
                    if (found) {
                        // Search for images inside the current 'a' element
                        const images = $(el).find('img').filter((i, el) => {
                            let currentAlt = $(el).attr('alt').toLowerCase();
                            console.log("Current Image Alt", currentAlt)
                            let found = targetList.some(target => currentAlt.includes(target))
                            if (found)
                                return true;
                            else
                                return false;
                        });
                        return true;
                    }
                    else {
                        return false;
                    }
                });

                if (links.length > 0) {
                    console.log(`Match found}`);
                    console.log(`URLs:`);

                    sendSlackMessage(`Match found`, "T04GK53T3V5", "B04GT47FA06", "GnDr0oyA9b6TgI1WswCqy9sK")
                    links.each(async (i, el) => {
                        sendSlackMessage(`https://www.hermes.com${$(el).attr('href')}`, "T04GK53T3V5", "B04GT47FA06", "GnDr0oyA9b6TgI1WswCqy9sK")
                        console.log("https://www.hermes.com" + $(el).attr('href'));
                        await writeToFile('./logs/allFound.json', [{ itemURL: "https://www.hermes.com" + $(el).attr('href'), time: new Date().toLocaleString("en-US", { timeZone: "America/Los_Angeles" }) }]);
                    });


                } else {
                    console.log(`Match not found`);
                }
            }
            res();
        })

    })

}
function getRandomArbitrary(min, max) {
    return Math.random() * (max - min) + min;
}
const randomDelay = async () => {
    const currentDelay = getRandomArbitrary(55, 120);
    console.log("currentDelay", currentDelay * 1000);
    // Increment the current URL index and reset it to 0 if all URLs have been visited
    currentUrlIndex++;
    if (currentUrlIndex >= url.length) {
        currentUrlIndex = 0;
    }

    let date = new Date();
    let offset = date.getTimezoneOffset() * 60000; //offset in milliseconds
    let currentTime = new Date(date.getTime() + offset + (-8 * 60 * 60 * 1000));
    let hours = currentTime.getHours();
    let shouldCrawl = hours >= schedule.start && hours < schedule.end
    console.log(`current time ${shouldCrawl}, schedule start time ${schedule.start}:00, schedule end time ${schedule.end}:00, currentTime ${currentTime}, current Hours ${hours}`)
    if ((schedule.isRunning && shouldCrawl) || (!schedule.isRunning && !shouldStop)) {
        await crawlWebsite();
    }
    // await crawlWebsite();
    // continue until we call the stop endpoint
    if (!shouldStop) {
        setTimeout(() => {
            randomDelay();
        }, currentDelay * 1000)
    }
}

app.post('/api/follow', (req, res) => {
    const { order } = req.body;
    if (order === "run-schedule") {
        if (isRunning) {
            res.json({ error: "To start a new crawler you should stop the current one" })
        } else {
            isRunning = true;
            shouldStop = false;
            schedule.isRunning = true;
            randomDelay();
            res.json({ message: `Running schedule, current server time ${new Date()}` })
        }

    }
    if (order === "start" && !isRunning) {
        isRunning = true;
        shouldStop = false;
        randomDelay();
        res.json({ message: "Crawler started successfully" })
    }
    if (order === "stop") {
        schedule.isRunning = false;
        isRunning = false;
        shouldStop = true;
        res.json({ message: "Crawler stopped successfully" })
    }
})

app.get("/api/wish-list", async (req, res) => {
    res.json({ wishList: targetList })
})

app.get("/api/found", async (req, res) => {
    let data = await readFile('./logs/allFound.json')
    res.json({ ...data })
})

app.get("/api/last", async (req, res) => {
    let data = await readFile('./logs/last.json')
    res.json({ ...data })
})

app.get("/api/status", async (req, res) => {
    res.json({ schedule, isRunning, shouldStop })
})

const readFile = (path) => {
    return new Promise((res, rej) => {
        fs.readFile(path, "utf-8", (err, data) => {
            if (err) {
                res({ error: err })
            } else {
                res({ found: JSON.parse(data) })
            }
        })
    })

}

const writeToFile = async (path, data) => {
    let currentData = await readFile(path);
    let newData = [...currentData?.found, ...data]
    return new Promise((res, rej) => {
        fs.writeFile(path, JSON.stringify(newData), (err) => {
            if (err) {
                res()
            } else {
                res()
            }
        })
    })

}

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`)
})


function createHeaders() {
    let headers = {};
    headers["User-Agent"] = faker.internet.userAgent();
    headers["Accept-Language"] = "en-US";
    headers["X-Forwarded-For"] = faker.internet.ip();
    headers["X-Real-IP"] = faker.internet.ip();
    headers["Referer"] = faker.internet.url();
    headers["Origin"] = faker.internet.url();
    // headers["Connection"] = faker.random.arrayElement(["keep-alive", "close"]);
    headers["Connection"] = "keep-alive";
    return headers;
}