function createMap(earthquakes) {

  // Create the tile layer that will be the background of our map
  var streetMap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.streets",
  accessToken: API_KEY
});

var satellite = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
  attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
  maxZoom: 18,
  id: "mapbox.satellite",
  accessToken: API_KEY
});

var dark = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
  });


  // Create a baseMaps object to hold the streetmap layer
  var baseMaps = {
    "Street Map": streetMap,
    "Satellite Map": satellite,
    "Dark Map": dark
  };

  // Create an overlayMaps object to hold the earthquakes layer
  var overlayMaps = {
    "Earthquakes": earthquakes
  };

  // Create the map object with options
  var map = L.map("map-id", {
    center: [0, 0],
    zoom: 2,
    layers: [satellite, earthquakes]
  });

  // Create a layer control, pass in the baseMaps and overlayMaps. Add the layer control to the map
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);

  function getColor(d) {
    return d < 1 ? 'rgb(255,255,255)' :
          d < 2  ? 'rgb(255,195,195)' :
          d < 3  ? 'rgb(255,135,135)' :
          d < 4  ? 'rgb(255,95,95)' :
          d < 5  ? 'rgb(255,45,45)' :
                      'rgb(255,0,0)';
  }

  var legend = L.control("legend");

  legend.onAdd = function (map) {
  
      var div = L.DomUtil.create('div', 'info legend'),
      grades = [0, 1, 2, 3, 4, 5],
      labels = [];

      div.innerHTML+='Magnitude<br><hr>'
  
      // loop through our density intervals and generate a label with a colored square for each interval
      for (var i = 0; i < grades.length; i++) {
          div.innerHTML +=
              '<i style="background:' + getColor(grades[i] + 1) + '">&nbsp&nbsp&nbsp&nbsp</i> ' +
              grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
  }
  
  return div;
  };
  
  legend.addTo(map);
  
  function createBoundaries(response2) {
    var boundaries = L.geoJSON(response2);
    boundaries.addTo(map);
  }
  d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json", createBoundaries);
}


function createMarkers(response) {

  function onEachFeature(quake, layer) {
    layer.bindPopup("<h3>" + quake.properties.place + "</h3>" +
    "<h3>" + Date(quake.properties.time) + "</h3>" +
    "<h3>" + "Magnitude: " + quake.properties.mag + "</h3>");
  }

  var quakes = L.geoJSON(response, {
    onEachFeature: onEachFeature,
    pointToLayer: function (quake, latlng) {
      var color;
      var r = 255;
      var g = Math.floor(255-80*quake.properties.mag);
      var b = Math.floor(255-80*quake.properties.mag);
      color= "rgb("+r+" ,"+g+","+ b+")"
      console.log(g)

      var geojsonMarkerOptions = {
        radius: 4*quake.properties.mag,
        fillColor: color,
        color: "black",
        weight: 1,
        opacity: 1,
        fillOpacity: 0.8
      };
      return L.circleMarker(latlng, geojsonMarkerOptions);
    }
  });

  // Sending our earthquakes layer to the createMap function
  createMap(quakes);
}




// Perform an API call to the USGS API to get earthquaken information. Call createMarkers when complete
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson", createMarkers);
