import undetected_chromedriver as uc
options = uc.ChromeOptions()
# options.add_experimental_option('w3c', False)
driver = uc.Chrome(options=options, service_args=['--port=57133'], port=57133)