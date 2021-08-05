var zipcode;

var headers = {
  headers: {
    'authority': 'api.target.com',
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9'
  }
}

chrome.storage.local.get(['key'], function (result) {
  if (result.key != null) {
  
    zipcode = result.key;
  }
});

const searchForProduct = async url => {

  try {
    const response = await axios.get(getProductRequestUrl(url), headers);
    
    const locations = response.data.products[0].locations;
    
    if (locations.length == 0) { throw error; }
    var displayLoc = "";
    for (let location of locations) {
      
      displayLoc += location.store_name + ", ";
    }
   
   
    return displayLoc;
  }
  catch (error) {

    console.log("Product not available at any locations or link is invalid.");

    
  }

};

function sendEmail(contents){
 
  chrome.storage.local.get(['email'], function (result) {
    if (result.email) {
      Email.send({
        Host : "smtp.elasticemail.com",
        Username: "productavailabilitynotifier@elasticemail.com",
        Password: "FA25D8CCED75F9AF9C96CFB258F90BB45565",
        To : result.email,
        From : "TargetAvailabilityNotifier@gmail.com",
        Subject : "Your Product Availability!",
        Body : contents,
      }).then(message => alert(message));
    }else{
      
    }
  });
 
}


function getProductRequestUrl(productUrl) {
  var productID = productUrl.slice(productUrl.length - 20, productUrl.length - 12);

  return "http://api.target.com/fulfillment_aggregator/v1/fiats/" + productID + "?key=ff457966e64d5e877fdbad070f276d18ecec4a01&nearby=" + zipcode + "&limit=20&requested_quantity=1&radius=50&fulfillment_test_mode=grocery_opu_team_member_test";

}
chrome.runtime.onInstalled.addListener(() => {
  console.log('onInstalled...');
  // create alarm after extension is installed / upgraded
  chrome.alarms.create('refresh', { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  var email = [];

  chrome.storage.local.get({
    list: []
  },
    async function (data) {
      if(data.list.length > 0){
      for(var i = 0; i < data.list.length; i++){
        let locations = await searchForProduct(data.list[i]);
        email[i] = "Locations available for " + data.list[i] + ": " + locations; 
        
      }
      sendEmail(email.join('<br>'));
    }
  }
  );
  
});








