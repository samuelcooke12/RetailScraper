const url = chrome.runtime.getURL(`${'filename'}/${this.filename}`);

const title = document.getElementById("textBox");
const zip = document.getElementById("zipBox");
const emailBox = document.getElementById("emailBox");
const emailDisplay = document.getElementById("email");
const emailHeader = document.getElementById("enterEmail");
const zipHead = document.getElementById("zipHead");
const zipCode = document.getElementById("zipCode");
const zipSetButton = document.getElementById("zipSet");
const zipResetButton = document.getElementById("zipReset");
const emailSetButton = document.getElementById("setEmail");
const emailResetButton = document.getElementById("resetEmail");


const resultScreen = document.getElementById("resultScreen");
const results = document.getElementById("results");
var links = [];
var zipcode;

var headers = {
  headers: {
    'authority': 'api.target.com',
    'accept': 'application/json',
    'accept-language': 'en-US,en;q=0.9'
  }
}


linksIsEmpty().then(res => {
  if (res) {
  var initArray = [];
  chrome.storage.local.set({
    list: initArray
  }, function () {
    console.log("added list");
  });
} 
})//storing the storage value in a variable and passing to update function




chrome.storage.local.get(['key'], function (result) {
  if (result.key != null) {
    zipCode.style.display = "";
    zipCode.textContent = "Zip Code Saved: " + result.key;
    zip.style.display = "none";
    zipHead.style.display = "none";
    zipSetButton.style.display = "none";
    zipResetButton.style.display = "";
    zipcode = result.key;
  }
});

chrome.storage.local.get(['email'], function (result) {
  if (result.email != null) {
    emailBox.style.display = "none";
    emailHeader.style.display = "none";
    emailDisplay.textContent = "Email Saved: " + result.email;
    emailDisplay.style.display = "";
    emailSetButton.style.display = "none";
    emailResetButton.style.display = "";
  }
});


function addLink(string) {
  chrome.storage.local.get({
    list: []
  },
    function (data) {
      console.log(data.list);
      update(data.list, string); //storing the storage value in a variable and passing to update function
    }
  );
  searchForProduct(string);

}

function linksIsEmpty() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get({list: []}, data => {
      resolve(data.list.length === 0)
    })
  })
}

const searchForProduct = async url => {

  try {
    const response = await axios.get(getProductRequestUrl(url), headers);
   
    const locations = response.data.products[0].locations;
    if (locations.length == 0) { throw error; }
    var displayLoc = "";
    for (let location of locations) {
      
      displayLoc += location.store_name + ", ";
    }
   
    
    results.style.display = "";
    results.textContent = displayLoc;
    return displayLoc;
  }
  catch (error) {

    console.log("Product not available at any locations or link is invalid.");

    results.style.display = "";
    results.textContent = "Not Found";
  }

};

function update(array, string) {
  array.push(string);
  //then call the set to update with modified value
  chrome.storage.local.set({
    list: array
  }, function () {
    console.log("added to list with new values");
  });
}


function getProductRequestUrl(productUrl) {
  var productID = productUrl.slice(productUrl.length - 20, productUrl.length - 12);

  return "http://api.target.com/fulfillment_aggregator/v1/fiats/" + productID + "?key=ff457966e64d5e877fdbad070f276d18ecec4a01&nearby=" + zipcode + "&limit=20&requested_quantity=1&radius=50&fulfillment_test_mode=grocery_opu_team_member_test";

}











// declare a function to handle form submission
const handleSubmit = async e => {
  e.preventDefault();
  resultScreen.textContent = "Results:"
  resultScreen.style.display = "";
  addLink(title.value);

  for (var i = 0; i < links.length; i++) {
    console.log(links[i]);
  }

};

const clearList = async e => {

  var initArray = [];
  chrome.storage.local.set({
    list: initArray
  }, function () {
    console.log("Reset List");
  });

  resultScreen.textContent = "Links have been cleared...";
  resultScreen.style.display = "";
  results.style.display = "";
  results.textContent = "";
  //storing the storage value in a variable and passing to update function

}

function getLinks() {


  chrome.storage.local.get({
    list: []
  },
    function (data) {

      links = data.list;
      console.log(links);

    }
  );
}

function displayLinks() {
  var printLinks = "";
  linksIsEmpty().then(res => {
    if (res) {
      console.log("links were empty");
      resultScreen.textContent = "No links to display. Please add one first.";
      resultScreen.style.display = "";
  
    } else {
      chrome.storage.local.get({
        list: []
      },
        function (data) {
          console.log(data.list);
          for (var i = 0; i < data.list.length; i++) {
            printLinks += data.list[i] + "\n";
          }
          
          resultScreen.textContent = "Links: ";
          resultScreen.style.display = "";
          results.style.display = "";
          results.textContent = printLinks;
          printLinks = "";
  
        }
      );
    }
  });
 

}


const setZipCode = async e => {
  chrome.storage.local.set({ key: zip.value }, function () {

  });
  chrome.storage.local.get(['key'], function (result) {
    console.log('Value currently is ' + result.key);
    zipCode.style.display = "";
    zipCode.textContent = "Zip Code Saved: " + result.key;

  });
  zip.style.display = "none";
  zipHead.style.display = "none";
  zipSetButton.style.display = "none";
  zipResetButton.style.display = "";

}

const resetZipCode = async e => {
  zip.style.display = "";
  zipHead.style.display = "";
  zipSetButton.style.display = "";
  zipResetButton.style.display = "none";

}

async function checkLinksAndNotify(){
  
  var email = [];
  linksIsEmpty().then(res => {
    if (res) {
      console.log("links were empty");
      resultScreen.textContent = "No links to display. Please add one first.";
      resultScreen.style.display = "";
  
    } else {
      chrome.storage.local.get({
        list: []
      },
        async function (data) {
          var printLinks = data.list.join('\n');
          for (var i = 0; i < data.list.length; i++) {
            let locations = await searchForProduct(data.list[i]);
            email[i] = "Locations available for " + data.list[i] + ": " + locations; 
          }
          resultScreen.textContent = "Notice: ";
          resultScreen.style.display = "";
          results.style.display = "";
          results.textContent = "Email has been sent with all of your products info!";
          sendEmail(email.join('<br>'));
        }
      );
    }
  });
  
}

function setEmail(){
  chrome.storage.local.set({ email: emailBox.value }, function () {
    
  });
  emailDisplay.textContent = "Email Saved: " + emailBox.value;
  emailDisplay.style.display = "";
  emailSetButton.style.display = "none";
  emailResetButton.style.display = "";
  emailBox.style.display = "none";
  emailHeader.style.display = "none";
  emailResetButton.style.display = "";
  

}

function resetEmail(){
  emailSetButton.style.display = "";
  emailBox.style.display = "";
  emailHeader.style.display = "";
  emailResetButton.style.display = "none";
  emailDisplay.style.display = "none";
}

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
      results.style.display = "";
      results.textContent = "Please enter an email.";
    }
  });
 
}
document.getElementById("submitButton").addEventListener("click", handleSubmit, true);
document.getElementById("clearButton").addEventListener("click", clearList, true);
document.getElementById("displayLinks").addEventListener("click", displayLinks, true);
document.getElementById("zipSet").addEventListener("click", setZipCode, true);
document.getElementById("zipReset").addEventListener("click", resetZipCode, true);
document.getElementById("notify").addEventListener("click", checkLinksAndNotify, true);
document.getElementById("setEmail").addEventListener("click", setEmail, true);
document.getElementById("resetEmail").addEventListener("click", resetEmail, true);

