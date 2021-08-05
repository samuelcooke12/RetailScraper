#in order to runs this scrip, need to install docker and slash
import json
import requests
from bs4 import BeautifulSoup
#instatiate an array
itemlist = []
#website that we are visiting
url = 'https://www.amazon.com/s?k=nike+shoes+men'
#creastes a connection
rq = requests.get('http://localhost:8050/render.html', params = {'url': url, 'wait': 2})

#store the html in soup
soup = BeautifulSoup(rq.text, 'html.parser')

#loops to find all the divs
products = soup.find_all('div', {'data-component-type': 's-search-result'})

def get_Product(soup):
    #checks for exceptions pass if the element is missing the class  
    try:
        #loops through the page and grab the text in the class specified 
        for items in products:
            shoelist = {
            'title': items.find("span", {'class':'a-size-base-plus a-color-base a-text-normal'}).text.strip(),
            'price': items.find("span", {'class':'a-offscreen'}).text.strip(),
            'rating': items.find("span", {'class':'a-icon-alt'}).text.strip(),
             
            }   
            #return an array with the elements         
            itemlist.append(shoelist)
    except:
        pass
        #creates a json doc named filename
        json_file = open("filename.json", "w")
        json.dump(itemlist, json_file)
        json_file.close()

        #Saves document as csv file
        #df = pd.DataFrame(itemlist)
        #df.to_csv("shoes.csv", header=None, index = None)
        #print (df)

#runs the method
get_Product(url)

#another way to do it
#prod = []
#prints name of the shoes
#for item in soup.findAll("span", {'class':'a-size-base-plus a-color-base a-text-normal'}):
#    prod.append(item.text)   
#    print (prod)

