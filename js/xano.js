// Create a variable for the API endpoint. In this example, we're accessing Xano's API
let xanoUrl = new URL('https://x8ki-letl-twmt.n7.xano.io/api:NHlYCKcX/');



// Define a function (set of operations) to get menu information.
// This will use the GET request on the URL endpoint
function getMenus() {

    // Create a request variable and assign a new XMLHttpRequest object to it.
    // XMLHttpRequest is the standard way you access an API in plain Javascript.
    let request = new XMLHttpRequest();

    // Define a function (set of operations) to get menu information.
    // Creates a variable that will take the URL from above and makes sure it displays as a string. 
    // We then add the word 'menu" so the API endpoint becomes https://x715-fe9c-6426.n7.xano.io/api:Iw1iInWB/menu
    let url = xanoUrl.toString() + 'menues';


    // Remember the 'request' was defined above as the standard way to access an API in Javascript.
    // GET is the verb we're using to GET data from Xano
    request.open('GET', url, true)

    // When the 'request' or API request loads, do the following...
    request.onload = function() {

        // Store what we get back from the Xano API as a variable called 'data' and converts it to a javascript object
        let data = JSON.parse(this.response)
        console.log(data)

        // Status 200 = Success. Status 400 = Problem.  This says if it's successful and no problems, then execute 
        if (request.status >= 200 && request.status < 400) {

            // Map a variable called cardContainer to the Webflow element called "Cards-Container"
            const cardContainer = document.getElementById("grid")

            // This is called a For Loop. This goes through each object being passed back from the Xano API and does something.
            // Specifically, it says "For every element in Data (response from API), call each individual item menu"
            data.forEach(menu => {
                // For each menu, create a div called card and style with the "Sample Card" class
                const style = document.getElementById('menu_item')
                // Copy the card and it's style
                const card = style.cloneNode(true)

                card.setAttribute('id', '');
                

                // When a menu card is clicked, update the record in xano
                card.addEventListener('click', function() {
                    updateMenu(menu.id) // This will update the menu in the Xano API
                } );

                // For each menu, Create an image and use the menu image coming from the API
                // const img = card.getElementsByTagName('IMG')[0]
                // img.src = menu.banner.url + "?tpl=big:box"; // using Xano's template engine to re-size the pictures down and make them a box

                // For each menu, create an h3 and set the text content to the menu's title
                const h3 = card.getElementsByTagName('H5')[0]
                h3.textContent = menu.Name;
                console.log(card);

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
(function() {
    getMenus();
})();

var Webflow = Webflow || [];
Webflow.push(function() {  
  // unbind webflow form handling (keep this if you only want to affect specific forms)
  $(document).off('submit');

  /* Any form on the page */
  $('form').submit(function(e) {
    e.preventDefault();

  	const $form = $(this); // The submitted form
    const $submit = $('[type=submit]', $form); // Submit button of form
    const buttonText = $submit.val(); // Original button text
    const buttonWaitingText = $submit.attr('data-wait'); // Waiting button text value
    const formMethod = $form.attr('method'); // Form method (where it submits to)
    const formAction = $form.attr('action'); // Form action (GET/POST)
    const formRedirect = $form.attr('data-redirect'); // Form redirect location
    let formData = new FormData;
    
    // Set waiting text
    if (buttonWaitingText) {
      $submit.val(buttonWaitingText); 
    }
    
    $form.serializeArray().forEach(item => {
    	formData.append(item.name, item.value);
    });
    
    let fileEl = document.getElementById('file');
    if (!fileEl || fileEl.files.length != 1) {
    	alert("Please choose a file.");
      return;
    }
    
    formData.append('file', fileEl.files[0])
    
    $.ajax(formAction, {
    	data: formData,
      method: formMethod,
      processData: false,
      contentType: false,
      cache: false
    })
    .done((res) => {
      // If form redirect setting set, then use this and prevent any other actions
      if (formRedirect) { window.location = formRedirect; return; }

    	$form
      	.hide() // optional hiding of form
    		.siblings('.w-form-done').show() // Show success
      	.siblings('.w-form-fail').hide(); // Hide failure
    })
    .fail((res) => {
      $form
      	.siblings('.w-form-done').hide() // Hide success
    	  .siblings('.w-form-fail').show(); // show failure
    })
    .always(() => {
      // Reset text
      $submit.val(buttonText);
    });
  });
});

var myState = {
    pdf: null,
    currentPage: 1,
    zoom: .12
}
pdfjsLib.getDocument('https://uploads-ssl.webflow.com/61bba5654fd40577054385ec/62fab21444971e07d942c44e_LIMITED%20MENU.pdf').then((pdf) => {
    myState.pdf = pdf;
    render();
});
function render() {
    myState.pdf.getPage(myState.currentPage).then((page) => {
        var canvas = document.getElementById("pdf_renderer");
        var ctx = canvas.getContext('2d');
        var viewport = page.getViewport(myState.zoom);
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        page.render({
            canvasContext: ctx,
            viewport: viewport
        });
    });
};