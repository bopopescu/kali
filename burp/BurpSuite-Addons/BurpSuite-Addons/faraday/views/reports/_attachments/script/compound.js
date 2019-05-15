	function load_all_hosts(design) {
		design = "hosts";
		var iurl	= "/" + workspace + "/_design/" + design + "/_view/byinterfacecount?group=true";
		var hurl	= "/" + workspace + "/_design/" + design + "/_view/hosts";
		var surl	= "/" + workspace + "/_design/" + design + "/_view/byservicecount?group=true";
		var hosts	= new Object();
		var interfaces	= new Object();
		var services	= new Object();
		
		hosts		= get_obj(hurl);
		interfaces	= get_obj(iurl, interfaces);
		services	= get_obj(surl, services);
		var table = "<div class='seccion2'><h2>Hosts report</h2>";
		table += "<table id=\"hosts-"+workspace+"\" class=\"tablesorter\"><thead><tr>"+
				"<th>Host</th>"+
				"<th>Services</th>"+
				"<th>Interfaces</th>"+
				"<th>OS</th>"+
				"<th>Owned</th>"+
				"</tr></thead><tbody>";
		$.each(hosts, function(k, v){
			var hname = "";
			if(!services.hasOwnProperty(k)) {
				services[k] = 0;
				hname = v.name;
			} else {
				hname = "<a href=\"host-"+k+"\" class=\"host\">"+v.name+"</a>";
			}
			if(!interfaces.hasOwnProperty(k)) interfaces[k] = 0;
			table += "<tr id=\"host-"+k+"\">"+
				"<td>"+hname+"</td>"+
				"<td>"+services[k]+"</td>"+
				"<td>"+interfaces[k]+"</td>"+
				"<td>"+v.os+"</td>"+
				"<td>"+v.owned+"</td></tr>";
		});
		table += "</tbody></table></div>";
		return table;
	}

	function load_hosts_by_service(name,bolean) {
		design = "hosts";
		var services 	= get_obj_filter(workspace, "services", "byname", name);
		var hids 	= [];
		$.each(services, function(k, v) {
			v = v['value'];
			if($.inArray(v['hid'], hids) < 0) {
				hids.push(v['hid']);
			}
		});
		var hosts 	= get_obj_filter(workspace, "hosts", "hosts", hids);
		var iurl	= "/" + workspace + "/_design/" + design + "/_view/byinterfacecount?group=true";
		var interfaces	= new Object();
		var surl	= "/" + workspace + "/_design/" + design + "/_view/byservicecount?group=true";
		var scount	= new Object();

		interfaces	= get_obj(iurl, interfaces);
		scount		= get_obj(surl, services);
		if(!bolean){
		var table = "<h2>Hosts with Service "+name+" ("+hids.length+" total)</h2>"+
				"<table id=\"hosts-"+workspace+"\" class=\"tablesorter\"><thead><tr>"+
				"<th>Host</th>"+
				"<th>Services</th>"+
				"<th>Interfaces</th>"+
				"<th>OS</th>"+
				"<th>Owned</th>"+
				"</tr></thead><tbody>";
		$.each(hosts, function(k, v){
			var id = v['id'];
			v = v['value'];
			if($.inArray(id, hids) > -1) {
				table += "<tr id=\"host-"+id+"\">"+
					"<td><a href=\"host-"+id+"\" class=\"host\">"+v['name']+"</a></td>"+
					"<td>"+scount[id]+"</td>"+
					"<td>"+interfaces[id]+"</td>"+
					"<td>"+v['os']+"</td>"+
					"<td>"+v['owned']+"</td></tr>";
			}
		});
		table += "</tbody></table></div>";
		}else{
			var table = "<table><tbody>"; 
			$.each(hosts, function(k, v){
			var id = v['id'];
			v = v['value'];
			if($.inArray(id, hids) > -1) {
				table += "<tr id=\"host-"+id+"\">"+
					"<td><p>"+v['name']+"</p></td></tr>";
			}
		});
		table += "</tbody></table>";
		}
		return table;
	}

	function load_services(hid, hname) {
		design = "hosts";
		// el param design ya no es el recibido por GET, puesto que ahora estamos en services
		var services = get_obj_filter(workspace, "services", "byhost", hid);
		var table = "<h2>Services for Host "+hname+" ("+services.length+" total)</h2>"+
			"<table id=\"services-"+workspace+"\" class=\"tablesorter\"><thead><tr>"+
			"<th>Name</th>"+
			"<th>Description</th>"+
			"<th>Owned</th>"+
			"<th>Ports</th>"+
			"<th>Protocol</th>"+
			"<th>Status</th></tr></thead><tbody>";
		$.each(services, function(k, v){
				var sid = v['id'];
				v = v['value'];
				var desc = (v['description'] === "") ? "n/a" : v['description'];
				var ports = "";
				if(v['ports'].length === 0) {
					ports = "no ports available";
				} else {
					for(i=0; i < v['ports'].length; i++){
						ports += v['ports'][i];
						if(v['ports'].length != 1 && i != (v['ports'].length-1)) {
							ports += ", ";
						}
					}
				}
				table += "<tr id=\"service-"+sid+"\">"+
					"<td><a href=\"service-"+sid+"\" class=\"service\">"+v['name']+"</a></td>"+
					"<td>"+desc+"</td>"+
					"<td>"+v['owned']+"</td>"+
					"<td>"+ports+"</td>"+
					"<td>"+v['protocol']+"</td>"+
					"<td>"+v['status']+"</td></tr>";
		});
		table += "</tbody></table></div>";
		return table;
	}

	function get_obj_filter(ws, design, view, key) {
		var db = new CouchDB(ws);
		var sview = design + "/" + view;
		if(typeof key === 'undefined') {
			var matches = db.view(sview);
		} else if($.isArray(key)) {
			var matches = db.view(sview, {keys: JSON.stringify(key)});
		} else {
			var matches = db.view(sview, {key: key});
		}
		return matches.rows;
	}

	function get_obj(ourl) {
		var ls = {};
		$.ajax({
			dataType: "json",
			url: ourl,
			async: false,
			success: function(data) {
				$.each(data.rows, function(n, obj){
					ls[obj.key] = obj.value;
				});	
			}
		});
		return ls;
	}

	function back_to_services(hid,hname){
		$(document).on('click', 'a#back_to_services', function(e) {
			var div = load_services(hid, hname);
			$("#hosts").html(div);
            // sacamos la tabla de hosts y agregamos un link de navegacion para volverla a cargar
            $("#hosts").prepend("<p><a href=\"load_all_hosts\">View all hosts</a> - <a id='back_to_host'>Back</a></p>");
		});
	}

$( document ).ready(function() {	
	$(document).on('click', 'a.host', function(e) {
            // no queremos que cargue nada
            e.preventDefault();
            // el ID del host que quiero traer es el ID del link clickeado menos el "host-" del ppio
            var hid = $(this).attr("href").split('-')[1];
            // el nombre del host que quiero traer es el valor del link
            var hname = $(this).text();
            var div = load_services(hid, hname);
            back_to_services(hid,hname);
            $("#hosts").html(div);
            // sacamos la tabla de hosts y agregamos un link de navegacion para volverla a cargar
            $("#hosts").prepend("<p><a href=\"load_all_hosts\">View all hosts</a> - <a id='back_to_host'>Back</a></p>");
});
        // cuando se clickea un servicio carga todos los hosts que tienen ese servicio
        $(document).on('click', 'a.service', function(e) {
            e.preventDefault();
            var sname = $(this).text();
            var div = load_hosts_by_service(sname);
            $("#hosts").html(div);
            // sacamos la tabla de hosts y agregamos un link de navegacion para volverla a cargar
            $("#hosts").prepend("<p><a href=\"load_all_hosts\">View all hosts</a> - <a id='back_to_services'>Back</a></p>");
        });

        // comportamiento para "View all hosts"
        $(document).on('click', 'a[href="load_all_hosts"]', function(e) {
            e.preventDefault();
            var div = load_all_hosts();
            $("#hosts").html(div);
        });
        $(document).on('click', 'a#back_to_host', function(e) {
		    e.preventDefault();
            var div = load_all_hosts();
            $("#hosts").html(div);
        });
});