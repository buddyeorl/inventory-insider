from seleniumbase import SB
from bs4 import BeautifulSoup
import requests
import random
import datetime
from datetime import time
import json

schedules=[
    {
        "start":"07:20:00",
        "end":"14:00:00"
    },
    # {
    #     "start":"07:20:00",
    #     "end":"09:30:00"
    # },
    # {
    #     "start":"10:30:00",
    #     "end":"14:00:00"
    # },   
]

current_schedule = schedules[0]
urls = [
    'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/small-leather-goods/#|',
    "https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/bags-and-clutches/",
    # 'https://www.hermes.com/us/en/category/women/bags-and-small-leather-goods/leather-accessories/#|',
    "https://www.hermes.com/us/en/search/?s=rodeo%20pegase%20pm#|"
]

# urls = [
#     'https://google.com',
# ]
index = 0 

targetList = [
    "evelyne 16 amazone",
    "rodeo pegase pm",
    "rodeo pm",
    "lindy mini",
    "lindy 26",
    "constance long to go"
]

def send_post_request(data):
    item_url="https://www.hermes.com" + data
    print(item_url)
    body = {
        "text": item_url
    }
    print(json.dumps(body))
    url="https://hooks.slack.com/services/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"
    headers = { "Content-type": "application/json" }

    try:
        response = requests.post(url, headers=headers, data=json.dumps(body))
        print("success?")
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as errh:
        print ("HTTP Error:",errh)
    except requests.exceptions.ConnectionError as errc:
        print ("Error Connecting:",errc)
    except requests.exceptions.Timeout as errt:
        print ("Timeout Error:",errt)
    except requests.exceptions.RequestException as err:
        print ("Something Else:",err)
def set_current_schedule():
    global current_schedule
    # Get the current time
    print("current schedules", current_schedule)
    now = datetime.datetime.now().time()
    for schedule in schedules:
        start_time = time.fromisoformat(schedule["start"])
        end_time = time.fromisoformat(schedule["end"])
        # start_time = datetime.time(schedule["start"])
        # end_time = datetime.time(schedule["end"])
        if start_time <= now <= end_time:
            current_schedule = schedule

def check_time_range(start_hour, end_hour):
    # Get the current time
    now = datetime.datetime.now().time()

    # Convert the start and end hours to datetime.time objects
    # start_time = datetime.time(start_hour, "%H:%M")
    # end_time = datetime.time(end_hour, "%H:%M")
    start_time = time.fromisoformat(start_hour)
    end_time = time.fromisoformat(end_hour)

    # Check if the current time is between the start and end times
    if start_time <= now <= end_time:
        print("The current time is between {} and {}.".format(start_time, end_time))
        return True
    else:
        print("The current time is not between {} and {}.".format(start_time, end_time))
        return False

def find_matches(list2):
    print(list2)
    print(targetList)
    matches = set()
    for string1 in targetList:
        for string2 in list2:
            print("checking", string1, string2)
            if string1.lower() in string2.lower():
                matches.add(string1)
    return list(matches)

with SB(uc=True) as sb:
    sb.open("https://google.com")
    def main():
        global index
        # writes a new file
        def append_to_json(data_set, file_path):
            try:
                with open(file_path, 'r') as f:
                    existing_data = json.load(f)
            except (FileNotFoundError, json.decoder.JSONDecodeError):
                existing_data = []


            with open(file_path, 'w') as f:
                for data in data_set:
                    print("writing data",data,datetime.datetime.now().time())
                    existing_data.extend([data])
                    # existing_data.extend([datetime.datetime.now().time()])
                    json.dump(existing_data, f)

            # # Open the file in append mode
            # with open(file_path, 'a') as file:
            #     print("open file")
            #     # Iterate through the set and create an object for each element
            #     for data in data_set:
            #         print("writing data",data,datetime.datetime.now().time())
            #         obj = {"url": data, "time_stamp": datetime.datetime.now().time()}
            #         print(obj)
            #         # Write the object to the file as a json
            #         # json.dump(obj, file)
            #         print("json dump")
            #         file.write(json.dump(obj))
            #         # Add a newline character to separate objects in the file
            #         file.write(",\n")
            print("Data appended to file successfully")
        def parse_hrefs(html_string):
            soup = BeautifulSoup(html_string, 'html.parser')
            links = soup.find_all('a')
            hrefs = [link.get('href') for link in links]
            return hrefs
        def find_links(html_string):
            soup = BeautifulSoup(html_string, 'html.parser')
            links = set()
            for a_tag in soup.find_all('a'):
                # print(a_tag)
                img_tag = a_tag.find('img')
                if img_tag:
                    img_alt = img_tag.get('alt').lower()
                    print(img_alt)
                    if any(target in img_alt for target in targetList):
                        links.add(a_tag['href'])
            return links
        def find_iframe(html_string):
            soup = BeautifulSoup(html_string, 'html.parser')
            links = set()
            print("this many iframes",len(soup.find_all('iframe')))
            for a_tag in soup.find_all('iframe'):
                print("iframe found WARNING")
                sb.sleep(10)
                return
        print(urls[index])
        sb.open_new_tab("https://google.com")
        sb.open(urls[index])
        index += 1 # increment index
        if index == len(urls): # if index is at the end of the array
            index = 0 # reset index to 0 (beginning of the array)
        sb.sleep(1)
        html_page = sb.get_page_source()
        print(html_page)
        try:
            print("here")
            # hlinks = sb.find_element("a")
            # print(hlinks)
            hermes_img = "hermes_img.png"
            sb.driver.save_screenshot(hermes_img)
            # print("\nScreenshot saved to: %s" % hermes_img)
            # hrefs = parse_hrefs(html_page)
            iframe = find_iframe(html_page)
            hrefs = find_links(html_page)
            # print(hrefs) # Output: ['https://www.example.com']
            # a set of matches
            # matches = find_matches(hrefs) 
            # print(matches)
            print(hrefs)
            if(len(hrefs)>0):
                # write matches to file
                print("writing to json")
                append_to_json(hrefs, "found.json")
                # send slack message
                print("sending to slack")
                for href in hrefs:
                    print("sending to slack",href)
                    print("found %s" % href)
                    send_post_request(href)
            handles = sb.driver.window_handles
            sb.driver.switch_to.window(handles[1])
            sb.driver.close()
            sb.driver.switch_to.window(handles[0])
        except:
            print("No a tags")
    # initial call
    main()
    while(True):
        print("starting cycle")
        print(current_schedule)
        while (not check_time_range(current_schedule["start"], current_schedule["end"])):
            set_current_schedule()
            print("Waiting")
            sb.sleep(10)
        sb.sleep(random.randint(10, 30))
        main()
    
    
