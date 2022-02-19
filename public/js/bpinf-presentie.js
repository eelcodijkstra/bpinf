
function bpinf_find_presentie() {
  var test = document.getElementById("bpinf-presentie");
  test.innerHTML = "<h3>Presentielijst</h3>";
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
  var fields = "id,title,slug";
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

// create html element for "aanmeldingen"
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
  
  var pdiv = document.getElementById("bpinf-presentie");
  var tables = pdiv.querySelectorAll("table");
  if (tables.length > 0) {
    for (let tab of tables) {
      tab.remove();
    }
  }
  pdiv.append(table);
  
  for (let aanmeld of aanmeldingen) {
    console.log(aanmeld.title.rendered + " - " + aanmeld.contact[0].post_title);
      row = table.insertRow(-1); // append
      
      cell = row.insertCell(0);
      var text = document.createTextNode(aanmeld.title.rendered);
      var link = document.createElement('a');
      link.href = bpinf_base_url + 'aanmelding/' + aanmeld.slug;
      link.appendChild(text);
      cell.appendChild(link);
      
      cell = row.insertCell(1);
      text = document.createTextNode(aanmeld.contact[0].post_title); // "te diep???"
      link = document.createElement('a');
      link.href = bpinf_base_url + 'contact/' + aanmeld.contact[0].post_name;
      link.appendChild(text);
      cell.appendChild(link);

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
  var fields = "id,title,contact,present,guid,slug";
  console.log(ids.toString());
  return fetch ( bpinf_json_url
              + 'aanmelding'
              + '?_fields=' + fields
              + '&include=' + ids.toString()
            );
}

function bpinf_get_aanmeldingen( act ) {
  var fields = "id,title,aanmeldingen,slug";
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
  document.getElementById("bpinf-presentie").append(sel);
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

var bpinf_json_url = null, bpinf_base_url = null;

document.addEventListener("DOMContentLoaded", function() {
  //your javascript code here
  bpinf_json_url = wpApiSettings.root + wpApiSettings.versionString;
  bpinf_base_url = wpApiSettings.root.replace('/wp-json/', '/');
//  bpinf_hello();
//  bpinf_find_demo();
//  bpinf_get_user();
//  bpinf_get_current_user();
  bpinf_get_activiteiten();
//  bpinf_get_pods();
//  bpinf_rest_test();
});