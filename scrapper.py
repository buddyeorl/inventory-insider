import undetected_chromedriver as uc
import random
import time
import requests
import faker

def generate_headers():
    f = faker.Faker()
    headers = {
        'User-Agent': random.choice(['Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36',
                                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:13.0) Gecko/20100101 Firefox/89.0',
                                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36 Edg/89.0.864.41',
                                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36']),
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
        'TE': 'Trailers',
        'X-Forwarded-For': f.ipv4()
    }
    return headers





options = uc.ChromeOptions()
for key, value in generate_headers().items():
    options.add_argument(f'--{key}={value}')
options.headless=True
options.add_argument('--headless')
# options.headless=True
# options.add_argument('--headless')
chrome = uc.Chrome(options=options)
chrome._web_element_cls = uc.UCWebElement
chrome.get('https://google.com/')
slack_URL = "https://hooks.slack.com/services/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"
url = [
    # 'https://nowsecure.nl',
    'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/',
    'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/small-leather-goods/'
]

targetList = [
    "evelyne 16 amazone",
    "rodeo pegase pm",
    "lindy mini",
    "constance long to go"
]
currentUrlIndex = -1


def set_random_timeout():
    timeout = random.uniform(60, 120)
    print(f"Timeout set for {timeout} seconds.")
    time.sleep(timeout)
    print("Timeout complete.")

def getHrefs():
    body = chrome.find_element('tag name', 'body')
    links = body.children('a',recursive=True)
    linkHrefs = []
    print(links)
    if(len(links)>0):
        for item in links:
            print(item.attrs.get("href"), "\n\n")
            print(item.text, "\n\n")
            stringInHref = check_substring(item.attrs.get("href"), targetList)
            if stringInHref:
                linkHrefs.append({"string":stringInHref, "href":item.attrs.get("href")})

    print(linkHrefs)
    if len(linkHrefs)>0:
        for item in linkHrefs:
            print(item)
            make_post_request(slack_URL, {"text": item["href"]})
    return

def check_substring(string, string_list):
    for item in string_list:
        if isinstance(item, str):
            string = string.lower()
            item = item.lower()
            if item in string:
                return item
    return False


def make_post_request(url, payload):
    try:
        headers = {'Content-type': 'application/json'}
        response = requests.post(url, json=payload, headers=headers)
        response.raise_for_status()
        return
    except requests.exceptions.HTTPError as err:
        print(err)

def main():
    global currentUrlIndex
    currentUrlIndex+= 1
    if currentUrlIndex >= len(url):
        currentUrlIndex = 0
    time.sleep(15)
    chrome.get(url[currentUrlIndex])
    getHrefs()
    set_random_timeout()
    for key, value in generate_headers().items():
        options.add_argument(f'--{key}={value}')
    main()

main()
