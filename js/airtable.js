// Create a variable for the API endpoint. In this example, we're accessing AirTable's API
let airTableUrl = new URL('https://api.airtable.com/v0/appbu3VR9FajZqRAQ/All%20Menues');





// Define a function (set of operations) to get menu information.
// This will use the GET request on the URL endpoint
function getMenus() {

  // Create a request variable and assign a new XMLHttpRequest object to it.
  // XMLHttpRequest is the standard way you access an API in plain Javascript.
  let request = new XMLHttpRequest();

  // Define a function (set of operations) to get menu information.
  // Creates a variable that will take the URL from above and makes sure it displays as a string. 
  let url = airTableUrl.toString();
  let airTableToken = 'keyArPJ2OF9tct6go';

  // Remember the 'request' was defined above as the standard way to access an API in Javascript.
  // GET is the verb we're using to GET data from AirTable
  request.open('GET', url, true) // true means it's asynchronous
  request.setRequestHeader('Authorization', 'Bearer ' + airTableToken);


  // PUT is the verb we're using to PUT data to AirTable. We can assign a variable to this verb to access it.
  let putRequest = new XMLHttpRequest();
  let selectedId = '';

  // POST is the verb we're using to POST data to Rebrandly. We can assign a variable to this verb to access it.
    let postRequest = new XMLHttpRequest();

  

  // When the 'request' or API request loads, do the following...
  request.onload = function () {

    // Store what we get back from the AirTable API as a variable called 'data' and converts it to a javascript object
    let response = JSON.parse(this.response);
    // let data should reuturn the response from only the records.fields
    let data = response.records.map(record => record.fields);
    console.log(data);

    // Status 200 = Success. Status 400 = Problem.  This says if it's successful and no problems, then execute 
    if (request.status >= 200 && request.status < 400) {

      // Map a variable called cardContainer to the Webflow element called "Cards-Container"
      const cardContainer = document.getElementById("selection_container");

      // Store a variable called Current Menue and set it to the menu with the boolean value of true for field "Live"
      const currentMenu = data.find(menu => menu.Live);
      // Store a variable called currentMenuPdf and set it to value of the first url field from the currentMenu.PDF array
      const currentMenuPdf = currentMenu.PDF[0].url;
      // Render the PDF

      var adobeDCView = new AdobeDC.View({
        clientId: "aef65b77e11d4094aaef508a445becf6",
        divId: "adobe-dc-view"
      });
      adobeDCView.previewFile({
        content: {
          location: {
            url: currentMenuPdf
          }
        },
        metaData: {
          fileName: currentMenu.Name
        }
      }, {
        embedMode: "IN_LINE",
        showPrintPDF: false
      });






      console.log('Current PDF Link', currentMenuPdf);

      console.log('Current Menu Item', currentMenu);
      // Find the element with id "current_live_menu" and set the text content to the current menu's name.
      document.getElementById("current_live_menu").textContent = currentMenu.Name;




      // This is called a For Loop. This goes through each object being passed back from the AirTable API and does something.
      // Specifically, it says "For every element in Data (response from API), call each individual item menu"
      data.forEach(menu => {

        // For each menu, create a div called card and style with the "Sample Card" class
        const style = document.getElementById('menu_item')
        // Copy the card and it's style
        const card = style.cloneNode(true)

        card.setAttribute('id', menu['Record ID']);
        card.setAttribute('class', 'link-block');




        card.addEventListener('click', function () {
          // add the class "selected" to the card and remove the class "selected" from all other cards.
          card.classList.add('selected');
          
          // Store the value of the clicked card's record id in a variable called cardId
          selectedId = card.id;
          console.log({ 'SelectedID':selectedId },{ 'CurrentMenuID':currentMenu['Record ID'] });
          //Unless the currently selected name is the same as the Current Menu, Find the element with id "selected_span" and set the text content to the currently selected menu's name.
          if (selectedId !== currentMenu['Record ID']) {
            document.getElementById('update_button').innerHTML = `Update QR Code To ${menu.Name}`;
            document.getElementById('update_button').classList.remove('disabled');

          } else {
            document.getElementById("update_button").innerHTML = `${menu.Name} Is Already Live`;
            document.getElementById("update_button").classList.add('disabled');

          }
        

          
                


          // Remove the class "selected" from all other cards.
          const cards = document.getElementsByClassName('link-block');
          for (let i = 0; i < cards.length; i++) {
            if (cards[i] !== card) {
              cards[i].classList.remove('selected');
            }
          }
          

          
          
          // Store the value of the clicked card's pdf link 
          const pdfLink = menu.PDF[0].url;
          // make sure we can use pdfLink in future functions
            window.pdfLink = pdfLink;

          // if the pdfLink is not null, then render the pdf
          console.log('PDF Link', pdfLink);
          if (pdfLink) {
            // Render the PDF

            var adobeDCView = new AdobeDC.View({
              clientId: "aef65b77e11d4094aaef508a445becf6",
              divId: "adobe-dc-view"
            });
            adobeDCView.previewFile({
              content: {
                location: {
                  url: pdfLink
                }
              },
              metaData: {
                fileName: menu.Name
              }
            }, {
              embedMode: "IN_LINE",
              showPrintPDF: false
            });
          }
        });

        
        // For each menu, create an h3 and set the text content to the menu's title
        const h3 = card.getElementsByTagName('H5')[0]
        h3.textContent = menu.Name;
        console.log(card);
       


        //  When a button with the id update_button is clicked, update Airtable.
        document.getElementById('update_button').addEventListener('click', function () {
         
           
          // If this element's class is not disabled, then do the following...
          if (!this.classList.contains('disabled')) {
          putRequest.open('PATCH', url, true);
          putRequest.setRequestHeader('Content-Type', 'application/json');
          putRequest.setRequestHeader('Authorization', 'Bearer ' + airTableToken);
         
          putRequest.send(JSON.stringify({

            "records": [{
              "id": selectedId,
              "fields": {
                "Live": true
              }
            },
            { "id": currentMenu['Record ID'],
              "fields": {
                "Live": false
              }
            }]
          }));

          // When the 'putRequest' or API request loads, do the following...
          putRequest.onload = function () {
            // If the request is successful, then execute the following...
            if (putRequest.status >= 200 && putRequest.status < 400) {
            
            // post to rebrandly to update the link
            postRequest.open('POST', 'https://api.rebrandly.com/v1/links/81e8b41bd9464d8d898abca513dc433e', true);
            postRequest.setRequestHeader('Content-Type', 'application/json');
            // update the link with the new pdf link
            postRequest.setRequestHeader("apikey", '686e4271282a42829e1a37df12b9c978');
            postRequest.send(JSON.stringify({
                "destination": pdfLink,
            }));
            // When the 'postRequest' or API request loads, do the following...
            postRequest.onload = function () {
                // If the request is successful, then execute the following...
                if (postRequest.status >= 200 && postRequest.status < 400) {
                    // refresh all the elements on the page.
                    console.log('Rebrandly Link Updated', postRequest.responseText);
                    // alert the user that the menu has been updated to {{name of the menu}}. when the alert is closed, refresh the page.
                    alert(`Menu Updated. The QR code will now point to the updated menu. However, it may take up to 5 minutes for the QR code to update if you've uploaded a new pdf.`);
                    location.reload();
                } else {
                    console.log('error');
                }
            }

                

            
            } else {
              console.log('Put Request Error');
            }
          }
        }   else {
          console.log('Update Button Disabled');
        }


        }); // end of update_button listener


        // For each menu, create an paragraph and set the text content to the menu's description
        // const p = card.getElementsByTagName('P')[0]
        // p.textContent = `${menu.description.substring(0, 240)}` // Limit to 240 chars

        // Place the card into the div "Cards-Container" 

        cardContainer.appendChild(card);
      })
    }
  }

  // Send menu request to API
  request.send();
}



// This fires all of the defined functions when the document is "ready" or loaded
(function () {
  getMenus();
})();

