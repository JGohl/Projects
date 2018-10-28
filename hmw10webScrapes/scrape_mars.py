def scrape():

    # Import dependencies
    from splinter import Browser
    from bs4 import BeautifulSoup
    from selenium import webdriver
    import pandas as pd

    # Set up splinter
    executable_path = {"executable_path": "chromedriver.exe"}
    browser = Browser("chrome", **executable_path, headless=False)

    # Find news title and description and assign to variables
    url = 'https://mars.nasa.gov/news/?page=0&per_page=40&order=publish_date+desc%2Ccreated_at+desc&search=&category=19%2C165%2C184%2C204&blank_scope=Latest'
    browser.visit(url)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    news_title = soup.find('li',class_='slide').find('div',class_='content_title').find('a').text
    news_p = soup.find('li',class_='slide').find('div',class_='article_teaser_body').text

    # Find featured image and assign to variable
    url = 'https://www.jpl.nasa.gov/spaceimages/?search=&category=Mars'
    browser.visit(url)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')

    # Click through browser to get to page with largesize image (wait time necessary for text to become visible)
    browser.click_link_by_partial_text('FULL IMAGE')
    browser.is_text_present('more_info', wait_time=5)
    browser.click_link_by_partial_text('more info')

    # Reset browser html, find image url
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    featured_image_url = ('https://www.jpl.nasa.gov' + soup.find('img', class_='main_image')['src'])

    # Get most recent weather tweet
    url = 'https://twitter.com/marswxreport?lang=en'
    browser.visit(url)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')
    mars_weather = soup.find('p', class_='TweetTextSize TweetTextSize--normal js-tweet-text tweet-text').text

    # Pandas scrape to get mars facts table
    url = 'https://space-facts.com/mars/'
    table = pd.read_html(url)

    # Convert table to dataframe
    df = table[0]

    #Convert table to html table string
    html_table = df.to_html("mars_table.html")

    # Create empty list to contain hemisphere dictionaries
    hemisphere_image_urls = []
    hemispheres = ['Cerberus', 'Schiaparelli', 'Syrtis Major', 'Valles Marineris']

    url = 'https://astrogeology.usgs.gov/search/results?q=hemisphere+enhanced&k1=target&v1=Mars'
    browser.visit(url)
    html = browser.html
    soup = BeautifulSoup(html, 'html.parser')

    # Loop through hemipsheres to gather title and link for each
    for hemisphere in hemispheres:
        browser.click_link_by_partial_text(str(hemisphere) + ' Hemisphere Enhanced')
        html = browser.html
        soup = BeautifulSoup(html, 'html.parser')
        cer_hem = {'title': soup.find('h2', class_='title').text[:-9], 
                   'img_url': 'https://astrogeology.usgs.gov' + soup.find('img', class_='wide-image')['src']}
        hemisphere_image_urls.append(cer_hem)
        browser.back()
        
        
    mars_dictionary = {'news_title': news_title, 
                        'news_p': news_p, 
                        'featured_image': featured_image_url, 
                        'weather': mars_weather, 
#                        'mars_table': html_table, 
                        'hemispheres': hemisphere_image_urls}
    
    return mars_dictionary
