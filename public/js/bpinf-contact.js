function bpinf_find_contactdiv() {
  var contact = document.getElementById("bpinf-contact");
  contact.appendChild(bpinf_make_contactform());
}

function bpinf_get_contact(id, form) {
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce};
  fetch(bpinf_json_url + 'contact/' + id.toString(), { headers: myheaders })
    .then(response => response.json())
    .then(data => {
        console.log("contact:");
        console.log(data);
        form.elements["voornaam"].value = data.voornaam;
        form.elements["tussenvoegsel"].value = data.tussenvoegsel;
        form.elements["achternaam"].value = data.achternaam; 
        var elts = form.getElementsByClassName("contacturl");
        var link = document.createElement("a");
        link.href = data.link;
        link.innerHTML = `${data.voornaam} ${data.tussenvoegsel} ${data.achternaam}`;
        elts[0].innerHTML = "--> contactpagina: ";
        elts[0].appendChild(link);
    });
}

function bpinf_lookup_contact(email, form) {
  var data = {
    _ajax_nonce: bpinf_data.nonce, // nonce from server
    action: "bpinf_action",
    pod: "contact",
    field: "email.meta_value",
    value: email
  };
  
  fetch( bpinf_data.ajaxurl, 
    { 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: new URLSearchParams( data )
    }
  ).then( response => response.json()    
  ).then( resp_data => { 
    console.log("result of lookup:" + JSON.stringify(resp_data));
    if (resp_data.ids.length == 0) {
      form.elements["achternaam"].value = `<contact voor ${email} niet gevonden>`;
    } else if (resp_data.ids.length == 1) {
      console.log("next: find name");
      bpinf_get_contact(resp_data.ids[0], form);
    } else {
      console.log("ids length: " + resp_data.ids.length);
    }
  });
}

// hiervoor controleren of er al een gebruiker met dit mailadres bestaat.
//
function bpinf_create_contact(data, form) {
  var title = data.voornaam + ' ' +
    (data.tussenvoegsel != "" ? data.tussenvoegsel + ' ' : "") +
    data.achternaam;
  var params = {
    title: title,
    voornaam: data.voornaam,
    tussenvoegsel: data.tussenvoegsel,
    achternaam: data. achternaam,
    email: data.email,
    status: 'publish'
  };
  var headers = {'X-WP-Nonce' : wpApiSettings.nonce};
  fetch(bpinf_json_url + 'contact',
    { 
      headers: {
        'X-WP-Nonce' : wpApiSettings.nonce,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }, 
      method: 'POST',
      body: JSON.stringify(params)    
    }
  ).then( response => response.json()
  ).then( data => {
    console.log("Created?");
    console.log(data);
    return {id: data.id, userid: data.user};
  }).then ( args => {
    return fetch(bpinf_json_url + 'contact/' + args.id,
      {
        headers: {
          'X-WP-Nonce' : wpApiSettings.nonce,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }, 
        method: 'POST',
        body: `{"author": "${args.userid}"}`
      }
    );
  }).then( response => response.json()
  ).then( data => {
    console.log('Update?');
    console.log(data);
    var elts = form.getElementsByClassName("contacturl");
    var link = document.createElement("a");
    link.href = data.link;
    link.innerHTML = data.title.rendered;
    elts[0].innerHTML = "--> contactpagina: ";
    elts[0].appendChild(link);    
  })
}

function bpinf_lookup_button(evt) {
  evt.stopPropagation()
  console.log("lookup button clicked");
  var button = evt.target;
  var form = button.form;
  var emailinput = form.elements["email"];
  var email = emailinput.value;
  console.log("email:" + email);
  var elts = form.getElementsByClassName("contacturl");
  elts[0].innerHTML = ""; // remove children...

  if (email == "") {  // better handling of empty input needed...
    emailinput.value = "eelco@infvo.nl";
    email = emailinput.value;
  }
  
  bpinf_lookup_contact(email, form);
}

function bpinf_create_button(evt) {
  evt.stopPropagation();
  console.log("create button clicked");
  var button = evt.target;
  var form = button.form;
  var emailinput = form.elements["email"];
  var email = emailinput.value;
  console.log("email: " + email);
  
  var data = {email: email};
  data.voornaam = form.elements["voornaam"].value;
  data.tussenvoegsel = form.elements["tussenvoegsel"].value;
  data.achternaam = form.elements["achternaam"].value;
  
  bpinf_create_contact(data, form);
}

function bpinf_make_contactform() {
  var form = document.createElement("form");

  var emaillabel = document.createElement("label");
  emaillabel.appendChild(document.createTextNode("e-mail"));
  var emailinput = document.createElement("input");
  emailinput.type = "email";
  emailinput.name = "email";
  emailinput.size = 20;
  emaillabel.for = emailinput;
  form.appendChild(emaillabel);
  form.appendChild(emailinput);
  
  var lookupbutton = document.createElement("button");
  lookupbutton.type = "button";
  lookupbutton.name = "lookup";
  lookupbutton.style.lineHeight = "2em";
  lookupbutton.appendChild(document.createTextNode("Zoek contact"));
  lookupbutton.addEventListener("click", bpinf_lookup_button);
  form.appendChild(lookupbutton);
  
  var breakDiv = document.createElement("div");
  breakDiv.classList.add("contacturl");
  form.appendChild(breakDiv);
  
  var namelabel = document.createElement("label");
  namelabel.appendChild(document.createTextNode("Voornaam"));
  var nameinput = document.createElement("input");
  nameinput.type = "text";
  nameinput.name = "voornaam";
  nameinput.size = 20;
  namelabel.for = nameinput;
  form.appendChild(namelabel);
  form.appendChild(nameinput);
  
  namelabel = document.createElement("label");
  namelabel.appendChild(document.createTextNode("Tussenvoegsel"));
  nameinput = document.createElement("input");
  nameinput.type = "text";
  nameinput.name = "tussenvoegsel";
  nameinput.size = 10;
  namelabel.for = nameinput;
  form.appendChild(namelabel);
  form.appendChild(nameinput);
  
  namelabel = document.createElement("label");
  namelabel.appendChild(document.createTextNode("Achternaam"));
  nameinput = document.createElement("input");
  nameinput.type = "text";
  nameinput.name = "achternaam";
  nameinput.size = 30;
  namelabel.for = nameinput;
  form.appendChild(namelabel);
  form.appendChild(nameinput);
  
  var createbutton = document.createElement("button");
  createbutton.type = "button";
  createbutton.name = "create";
  createbutton.style.lineHeight = "2em";
  createbutton.appendChild(document.createTextNode("Maak nieuw contact"));
  createbutton.addEventListener("click", bpinf_create_button);
  form.appendChild(createbutton); 
   
  return form;
}

function bpinf_ajax_test() {
  var data = {
    _ajax_nonce: bpinf_data.nonce, // nonce from server
    action: "bpinf_action",
    pod: "user",
    field: "user_email",
    value: "grietje@infvo.nl"
  };
  
  fetch( bpinf_data.ajaxurl, 
    { 
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      method: 'POST',
      body: new URLSearchParams( data )
    }
  ).then( resp_data => { 
    console.log(resp_data); 
  });
}

document.addEventListener("DOMContentLoaded", function() {
  //your javascript code here
  bpinf_json_url = wpApiSettings.root + wpApiSettings.versionString;
  bpinf_base_url = wpApiSettings.root.replace('/wp-json/', '/');
//  bpinf_hello();
//  bpinf_find_demo();
//  bpinf_get_user();
//  bpinf_get_current_user();
  bpinf_find_contactdiv();
  bpinf_ajax_test();
//  bpinf_get_pods();
//  bpinf_rest_test();
});