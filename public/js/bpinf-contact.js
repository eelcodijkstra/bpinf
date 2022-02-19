function bpinf_find_contactdiv() {
  var contact = document.getElementById("bpinf-contact");
  contact.appendChild(bpinf_make_contactform());
}

function bpinf_make_contactform() {
  var form = document.createElement("form");
  var namelabel = document.createElement("label");
  namelabel.appendChild(document.createTextNode("Voornaam"));
  var nameinput = document.createElement("input");
  nameinput.type = "text";
  nameinput.name = "voornaam";
  nameinput.size = 20;
  namelabel.for = nameinput;
  form.appendChild(namelabel);
  form.appendChild(nameinput);
  var emaillabel = document.createElement("label");
  emaillabel.appendChild(document.createTextNode("e-mail"));
  var emailinput = document.createElement("input");
  emailinput.type = "email";
  emailinput.name = "email";
  emailinput.size = 20;
  emaillabel.for = emailinput;
  form.appendChild(namelabel);
  form.appendChild(nameinput);
  form.appendChild(emaillabel);
  form.appendChild(emailinput);
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