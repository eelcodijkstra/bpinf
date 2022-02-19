function bpinf_hello() {
  console.log("Hello from BPINF");
}

function bpinf_find_demo() {
  var test = document.getElementById("bpinf-test");
  test.innerHTML = "<h3>Hello!?!</h3>";
}

function bpinf_rest_test() {
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  fetch(bpinf_json_url + 'school', { headers: myheaders })
    .then(response => response.json())
    .then(data => console.log(data));
}

function bpinf_get_user() {
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  console.log(myheaders.toString());
  if (bpinf_user_id != 0) {
    fetch( bpinf_json_url + 'users/' + bpinf_user_id.toString() + '?context=edit',
           { headers: myheaders })
      .then(response => response.json())
      .then(data => console.log(data));    
  }
}

function bpinf_get_current_user() {
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  fetch(bpinf_json_url + 'users/me', { headers: myheaders })
    .then(response => response.json())
    .then(data => console.log(data));
}

function bpinf_get_activiteiten() {
  var fields = "id,title,post_title";
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  fetch(bpinf_json_url + 'activiteit?_fields=' + fields, { headers: myheaders })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        bpinf_make_act_selector(data);
    });
}

// handler for "present" checkbox: post setting to REST API
function bpinf_present_handler(evt) {
  var parent = evt.target.parentElement;
  var fields = "?_fields=present";
  if (parent.dataset.field == "present") {
    var checked = evt.target.checked;
    fetch(bpinf_json_url + 'aanmelding/' + parent.dataset.aanmeldid.toString() + fields, 
    { method: "post",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-WP-Nonce' : wpApiSettings.nonce.toString()
      },
      body: JSON.stringify({
        present: ( checked ? "1" : "0")
      })
    })
    .then(response => response.json())
    .then(data => {
        if (data.present == ( checked ? "1" : "0")) {
          console.log("update OK");
        } else {
          console.log("update niet OK");
        }
        console.log(data);
    });
  }
}

function bpinf_make_table_aanmeldingen( aanmeldingen ) {
  var table = document.createElement("table");
  var thead = table.createTHead();
  var row = document.createElement("tr");
  thead.appendChild(row);
  var cell = document.createElement("th");
  cell.appendChild(document.createTextNode("aanmelding"));
  row.appendChild(cell);
  cell = document.createElement("th"); 
  cell.appendChild(document.createTextNode("deelnemer"));
  row.appendChild(cell);
  cell = document.createElement("th"); 
  cell.appendChild(document.createTextNode("present"));
  row.appendChild(cell);  
  
  var testdiv = document.getElementById("bpinf-test");
  var tables = testdiv.querySelectorAll("table");
  if (tables.length > 0) {
    for (let tab of tables) {
      tab.remove();
    }
  }
  testdiv.append(table);
  
  for (let aanmeld of aanmeldingen) {
    console.log(aanmeld.title.rendered + " - " + aanmeld.contact[0].post_title);
      row = table.insertRow(-1); // append
      
      cell = row.insertCell(0);
      var text = document.createTextNode(aanmeld.title.rendered);
      var link = document.createElement('a');
      link.href = aanmeld.guid.rendered;
      link.appendChild(text);
      cell.appendChild(link);
      
      cell = row.insertCell(1);
      text = document.createTextNode(aanmeld.contact[0].post_title); // "te diep???"
      cell.appendChild(text);

      cell = row.insertCell(2);
      var present = aanmeld.present;
      if (present.length == 0) {
        present = "0"; 
      }
      var checkbox = document.createElement('input');
      checkbox.type = "checkbox";
      checkbox.name = "present" + aanmeld.id.toString();
      checkbox.checked = present == "1";
      checkbox.addEventListener('change', bpinf_present_handler);
      text = document.createTextNode(present);
      cell.appendChild(checkbox);
      cell.dataset.aanmeldid = aanmeld.id;
      cell.dataset.field = "present";
  }
}

function bpinf_get_aanmeldingen_data ( ids ) {
  var fields = "id,title,contact,present,post_title,guid";
  console.log(ids.toString());
  return fetch ( bpinf_json_url
              + 'aanmelding'
              + '?_fields=' + fields
              + '&include=' + ids.toString()
            );
}

function bpinf_get_aanmeldingen( act ) {
  var fields = "id,title,aanmeldingen,post_title";
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  fetch( bpinf_json_url
         + 'activiteit/' + act.toString()
         + '?_fields=' + fields
         , { headers: myheaders }
         )
    .then( response => response.json() )
    .then( data => {
        console.log(data);
        return bpinf_get_aanmeldingen_data (data.aanmeldingen);
    })
    .then ( response => response.json() )
    .then( data => {
        console.log(data); 
        bpinf_make_table_aanmeldingen(data);

    });  
}

function bpinf_handle_select( evt ) {
  console.log("select activiteit: " + evt.target.value);
  if (parseInt(evt.target.value) != 0) {
    bpinf_get_aanmeldingen(evt.target.value);
  }
}

function bpinf_make_act_selector( activiteiten ) {
  var sel = document.createElement("select");
  document.getElementById("bpinf-test").append(sel);
  var null_opt = document.createElement("option");
  null_opt.value = "0";
  null_opt.text = "-- selecteer een activiteit --";
  sel.add(null_opt);
  for (let act of activiteiten) {
    console.log(act.id.toString() + " - " + act.title.rendered);
    var opt = document.createElement("option");
    opt.value = act.id.toString();
    opt.text = act.title.rendered;
    sel.add(opt);
  }
  sel.addEventListener("change", bpinf_handle_select);
}

function bpinf_get_pods() {
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  fetch('/wp-json'  //bpinf_json_url
        + '/pods/v1/fields'
        , { headers: myheaders }
        )
    .then(response => response.json())
    .then(data => {
        console.log("PODS:")
        console.log(data);
    });
}

var bpinf_contact = null;

// get contact-info for single contact page
// assume: path is '/contact/contact-name/'
function bp_get_current_contact() {
  var path = window.location.pathname;
  console.log("Path: " + path);
  var parts = path.split('/');
  // check for "contact" part!!
  var contact = parts.pop();
  while (contact == "") {
    contact = parts.pop();
  }
  console.log("contact:" + contact);
  bpinf_contact = contact;
}

var bpinf_schools = null;

function get_schools ( cont ) {
  var fields = "id,title,slug,plaats";
  var myheaders = {'X-WP-Nonce' : wpApiSettings.nonce.toString()};
  fetch( bpinf_json_url + 'school'
         + '?_fields=' + fields
         , { headers: myheaders }
       )
    .then(response => response.json())
    .then(data => {
        console.log("schools:")
        console.log(data);
        bpinf_schools = data;
        cont();
    });
}

function get_city_schools( city ) {
  var regex = new RegExp( city, 'i' ); // case insensitive
  return bpinf_schools.filter( school => regex.test(school.title.rendered + ' - ' + school.plaats) );
}

function handle_plaats_changed (evt) {
  var sel = document.querySelector('div.schoolselector select');
  console.log("remove options: " + sel.length.toString());
  
  for (let i = sel.length - 1; i > 0; i--) {
    sel.remove(i);
  }

  var local_schools = get_city_schools(evt.target.value);
  for (let school of local_schools) {
    console.log(school.id.toString() + " - " + school.title.rendered);
    var opt = document.createElement("option");
    opt.value = school.id.toString();
    opt.text = school.title.rendered + ' - ' +  school.plaats;
    sel.add(opt);
  }
  if (local_schools.length == 1) {
    sel.value = local_schools[0].id.toString();
    sel.selectedIndex = 1;
    sel.focus();
  } else {
    sel.value = '0';
  }
}

function make_schoolselector( elt ) {
  var form = document.createElement('form');
  elt.appendChild(form);
  var plaats = document.createElement('input');
  form.appendChild(document.createTextNode("Filter op schoolnaam of -plaats:"));
  form.appendChild(plaats);
  plaats.type = "text";
  plaats.size = "10";
  plaats.name = "plaats";
  plaats.addEventListener("change", handle_plaats_changed);
  var sel = document.createElement("select");
  form.appendChild(sel);
  var null_opt = document.createElement("option");
  null_opt.value = "0";
  null_opt.text = "-- selecteer een school --";
  sel.add(null_opt);
  for (let school of bpinf_schools) {
    console.log(school.id.toString() + " - " + school.title.rendered);
    var opt = document.createElement("option");
    opt.value = school.id.toString();
    opt.text = school.title.rendered + ' - ' +  school.plaats;
    sel.add(opt);
  }
}

function bpinf_find_schoolselector() {
  var elts = document.getElementsByClassName('schoolselector');
  if (elts.length > 0) {
    get_schools( () => { make_schoolselector(elts[0]); } );
  }
}

var bpinf_json_url = null;

document.addEventListener("DOMContentLoaded", function() {
  //your javascript code here
  bpinf_json_url = wpApiSettings.root + wpApiSettings.versionString;  
  bpinf_hello();
//  bpinf_find_demo();
//  bpinf_get_user();
//  bpinf_get_current_user();
  bpinf_get_activiteiten();
  bpinf_find_schoolselector();
//  bpinf_get_pods();
//  bpinf_rest_test();
});