import express from 'express';
import fetch from 'node-fetch';
import request from 'request';
import cheerio from 'cheerio';
import fs from 'fs';


const PORT = process.env.PORT || 3001;
var shouldStop = false;
var isRunning = false;
var schedule = {
    isRunning: false,
    start: new Date().setHours(15),// 7AM IN PST
    end: new Date().setHours(23) // 
}
//initialize app
const app = express();
app.use(express.json());

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


function crawlWebsite() {
    console.log('starting to crawl', url[currentUrlIndex])
    return new Promise((res, rej) => {
        // make an HTTP request to the website
        request(url[currentUrlIndex], {
            headers: {
                'User-Agent': 'Chrome/89.0.4389.82',
                'Accept-Language': 'en-US,en;q=0.9',
                // 'Accept-Encoding': 'gzip, deflate, br',
                'Connection': 'keep-alive',
                // 'Pragma': 'no-cache',
                'Cache-Control': 'no-cache'
            }
        }, async function (error, response, html) {
            console.log('request recevied', response.statusCode)
            await writeToFile('./logs/last.json', [response.statusCode]);
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
                    links.each((i, el) => {
                        sendSlackMessage(`https://www.hermes.com${$(el).attr('href')}`, "T04GK53T3V5", "B04GT47FA06", "GnDr0oyA9b6TgI1WswCqy9sK")
                        console.log("https://www.hermes.com" + $(el).attr('href'));
                    });

                    await writeToFile('./logs/allFound.json', links.map((el) => $(el).attr('href')));
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

    let currentTime = new Date();
    let isScheduledFinished = currentTime > schedule.start && currentTime < schedule.end
    if ((schedule.isRunning && !isScheduledFinished) || (!schedule.isRunning && !shouldStop)) {
        console.log(`current time ${isScheduledFinished}, schedule time ${schedule.end}, currentTime ${currentTime}`)
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