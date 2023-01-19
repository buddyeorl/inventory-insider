import fetch from 'node-fetch'
import request from 'request'
import cheerio from 'cheerio'

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
        }, function (error, response, html) {
            console.log('request recevied', response.statusCode)
            if (!error && response.statusCode == 200) {
                // parse the HTML of the website
                const $ = cheerio.load(html);
                const abx = $('span').filter((i, el) => {
                    console.log($(el).text().toLowerCase())
                    let currentElText = $(el).text().toLowerCase()
                    let found = targetList.some(target => currentElText.includes(target))
                    // if (currentElText.includes(targetString.toLowerCase()) || currentElText.includes(targetString2.toLowerCase()))
                    if (found)
                        return true
                    else {
                        return false
                    }
                });

                // if ($(el).attr('alt') !== undefined) {
                //     console.log("alt attribute", $(el).attr('alt'))
                //     currentElText = $(el).attr('alt').toLowerCase()
                // }
                const links = $('a').filter((i, el) => {
                    let currentElText = $(el).text().toLowerCase();
                    let found = targetList.some(target => currentElText.includes(target))
                    if (found) {
                        // Search for images inside the current 'a' element
                        const images = $(el).find('img').filter((i, el) => {
                            let currentAlt = $(el).attr('alt').toLowerCase();
                            console.log(currentAlt)
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
    await crawlWebsite();
    setTimeout(() => {
        randomDelay();
    }, currentDelay * 1000)

}

// run the crawlWebsite function every 60 seconds
randomDelay();

