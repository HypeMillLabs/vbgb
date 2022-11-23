// the rebrandly api url
let rebrandlyUrl = new URL('https://api.rebrandly.com/v1/links/81e8b41bd9464d8d898abca513dc433e');

// search the page for the elements with id "menu_item" and store them in a variable
let menus = document.querySelectorAll('#menu_item');

// find the element with id "refresh_button" and add an event listener to it
document.getElementById('refresh_button').addEventListener('click', function () {
  // when the button is clicked, refresh the page
  location.reload();
});


// create an array to store the value of menu item urls, names and ids
let menuItems = [];
// loop through the menus and store the url, name, id and live in the menuItems array
menus.forEach(menu => {
    let menuItem = {
        url: menu.getAttribute('data-url'),
        name: menu.getAttribute('data-name'),
        id: menu.getAttribute('data-id'),
        live: menu.getAttribute('data-live')
    }
    menuItems.push(menuItem);
});





// get the current rebrandly link
  let request = new XMLHttpRequest();
  let url = rebrandlyUrl.toString();
  let rebrandlyKey = '686e4271282a42829e1a37df12b9c978';
  request.open('GET', url, true);
  request.setRequestHeader('apikey', rebrandlyKey);
  request.onload = function () {
    let response = JSON.parse(this.response);
    // store the response.destination in a way we can access it outside of this function
    let rebrandlyLink = response.destination;
    // search menuItems for the item with the same url as the rebrandly link and set live to true and all others to false
    console.log({'rebrandlyLink': rebrandlyLink, 'menuItems': menuItems[0].url});
    menuItems.forEach(item => {
      if (item.url === rebrandlyLink) {
        item.live = true;
        // updated the live data attribute on the menu item
        document.querySelector(`[data-id="${item.id}"]`).setAttribute('data-live', true);
        // add the class "selected" to the menu item's parent
      
        document.querySelector(`[data-id="${item.id}"]`).parentElement.classList.add('selected');
      } else {
        item.live = false;
      }
    });
    // update the element with the id "current_live_menu" to show the name of the current live menu
    document.getElementById('current_live_menu').textContent = menuItems.filter(item => item.live === true)[0].name;
    // add the class "selected" to the live menu item button and remove it from all others
    // this element has the id "menu_item" and the data-id of the current live menu item
    // store the currently live menu item url and name
    let currentLiveMenu = {
      url: menuItems.filter(item => item.live === true)[0].url,
      name: menuItems.filter(item => item.live === true)[0].name,
      live: menuItems.filter(item => item.live === true)[0].live
    };


   // Render the PDF

   var adobeDCView = new AdobeDC.View({
    clientId: "4eeb0084da814327bfa75e9ac9abc04f",
    divId: "adobe-dc-view"
  });
  adobeDCView.previewFile({
    content: {
      location: {
        url: currentLiveMenu.url
      }
    },
    metaData: {
      fileName: currentLiveMenu.name
    }
  }, {
    embedMode: "IN_LINE",
    showPrintPDF: false
  });

    

  }

  request.send();

  console.log({'menu items': menuItems});

 // create an event listener for the menu items when they are clicked
  menus.forEach(menu => {
    menu.addEventListener('click', function () {
      console.log({'live': this.getAttribute('data-live')});
      // get the id of the clicked menu item
      let id = this.getAttribute('data-id');
      // get the name of the clicked menu item
      let name = this.getAttribute('data-name');
      // get the url of the clicked menu item
      let url = this.getAttribute('data-url');
      // get the live status of the clicked menu item
      let live = this.getAttribute('data-live');
      // create an object to store the id, name, url and live status
      let selectedMenuItem = {
        id: id,
        name: name,
        url: url,
        live: live
        
      }
      // add the selected class to the clicked menu item and remove it from all others
      menus.forEach(menu => {
        menu.parentElement.classList.remove('selected');
      });
      this.parentElement.classList.add('selected');
      


   var adobeDCView = new AdobeDC.View({
    clientId: "4eeb0084da814327bfa75e9ac9abc04f",
    divId: "adobe-dc-view"
  });
  adobeDCView.previewFile({
    content: {
      location: {
        url: selectedMenuItem.url
      }
    },
    metaData: {
      fileName: selectedMenuItem.name
    }
  }, {
    embedMode: "IN_LINE",
    showPrintPDF: false
  });


  // if the selected menu item is not live, remove the class "disabled" from the id "update_button"
      if (selectedMenuItem.live === 'false') {
        document.getElementById('update_button').classList.remove('disabled');
        // change the text of the button to "Update QR Code to {{name of selected menu item}}"
        document.getElementById('update_button').textContent = `Update QR Code to ${selectedMenuItem.name}`;
      } else {
        document.getElementById('update_button').classList.add('disabled');
        // change the text of the button to "QR Code is up to date"
        document.getElementById('update_button').textContent = 'QR Code is up to date';
      }

    
    }); // end of event listener
  }); // end of menus.forEach

  // create an event listener for the update button
  document.getElementById('update_button').addEventListener('click', function () {
    // if the update button does not have the class "disabled" then update the rebrandly link
    if (!this.classList.contains('disabled')) {
      // get the id of the currently live menu item
      let currentLiveMenuId = menuItems.filter(item => item.live === true)[0].id;
      
      let newMenuId = document.querySelector('.selected').firstElementChild.getAttribute('data-id');
      // get the url of the new menu item
      let newMenuUrl = document.querySelector('.selected').firstElementChild.getAttribute('data-url');
      // get the name of the new menu item
      let newMenuName = document.querySelector('.selected').firstElementChild.getAttribute('data-name');
      // create an object to store the new menu item id, url and name
      let newMenuItem = {
        id: newMenuId,
        url: newMenuUrl,
        name: newMenuName
      }
      // update the rebrandly link
      let request = new XMLHttpRequest();
      let url = rebrandlyUrl.toString();
      request.open('POST', url, true);
      request.setRequestHeader('apikey', rebrandlyKey);
      request.setRequestHeader('Content-Type', 'application/json');
      request.onload = function () {
        // update the element with the id "current_live_menu" to show the name of the current live menu
        document.getElementById('current_live_menu').textContent = newMenuItem.name;
        // remove the class "selected" from the currently live menu item and add it to the new menu item
        document.querySelector(`[data-id="${currentLiveMenuId}"]`).classList.remove('selected');
        document.querySelector(`[data-id="${newMenuItem.id}"]`).classList.add('selected');
        // update the data-live attribute on the currently live menu item to false and the new menu item to true
        document.querySelector(`[data-id="${currentLiveMenuId}"]`).setAttribute('data-live', false);
        document.querySelector(`[data-id="${newMenuItem.id}"]`).setAttribute('data-live', true);
        // update the live property on the menuItems object for the currently live menu item to false and the new menu item to true
        menuItems.forEach(item => {
          if (item.id === currentLiveMenuId) {
            item.live = false;
          } else if (item.id === newMenuItem.id) {
            item.live = true;
          }
        });
        // add the class "disabled" to the update button
        document.getElementById('update_button').classList.add('hide');
        // remove the class "hide" from the id "success_message" and the id "screen"
        document.getElementById('screen').classList.remove('hide');
      }
      request.send(JSON.stringify({
        destination: newMenuItem.url
      }));
    }
  }); // end of event listener
