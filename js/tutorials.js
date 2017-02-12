//Andrea Eibergen

//QuickStart Tutorial

//initialize map on "mapid" div with a set center and zoom
var mymap = L.map('mapid').setView([51.505, -0.09], 13);
//var mymap = L.map('mapid').setView([39.74739, -105], 13);

//load and display tile layers on map
L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap contributors</a>'
}).addTo(mymap); //The .addTo adds layer to the given map

//creates a marker given lat long
var marker = L.marker([51.5, -0.09]).addTo(mymap);

//instantiates a circle object given lat long
var circle = L.circle([51.508, -0.11], {
    radius: 1000,
    color: 'red',
    fillColor: '#f03',
    fillOpacity: 0.5
}).addTo(mymap);

//creates a polygon given lat/long
var polygon = L.polygon([
    [51.509, -0.08],
    [51.503, -0.06],
    [51.51, -0.047]
]).addTo(mymap);

marker.bindPopup("<strong>Hello world!</strong><br />I am a popup.").openPopup();
circle.bindPopup("I am a circle.");
polygon.bindPopup("I am a polygon.");

//creates popup object given optional object that describes location and appearance/what it says
var popup = L.popup()
    .setLatLng([51.5, -0.09])
    .setContent("I am a standalone popup.")
    .openOn(mymap);

//again, creates popup object
var popup = L.popup();

function onMapClick(e) {
    popup
        .setLatLng(e.latlng)
        .setContent("You clicked the map at " + e.latlng.toString())
        .openOn(mymap);
}

mymap.on('click', onMapClick);

//GeoJSON Tutorial

var mymap = L.map('mapid').setView([39.74739, -105], 13);

//creates a geojson layer, specifically a new feature in this case
L.geoJSON(geojsonFeature).addTo(mymap);

var myLines = [{
    "type": "LineString",
    "coordinates": [[-104.986947, 39.741183], [-104.998253, 39.749944]]
}, {
    "type": "LineString",
    "coordinates": [[-105.000887, 39.751856], [-105.003427, 39.753949]]
}];

var myStyle = {
    "color": "#ff7800",
    "weight": 5,
    "opacity": 0.65
};

//creates a new geojson layer, specifically a new feature here
L.geoJSON(myLines, {
    style: myStyle
}).addTo(mymap);

var states = [{
    "type": "Feature",
    "properties": {"party": "Republican"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-104.05, 48.99],
            [-97.22,  48.98],
            [-96.58,  45.94],
            [-104.03, 45.94],
            [-104.05, 48.99]
        ]]
    }
}, {
    "type": "Feature",
    "properties": {"party": "Democrat"},
    "geometry": {
        "type": "Polygon",
        "coordinates": [[
            [-109.05, 41.00],
            [-102.06, 40.99],
            [-102.03, 36.99],
            [-109.04, 36.99],
            [-109.05, 41.00]
        ]]
    }
}];

//again, creating a new geojson layer for the states this time
L.geoJSON(states, {
    style: function(feature) {
        switch (feature.properties.party) {
            case 'Republican': return {color: "#ff0000"};
            case 'Democrat':   return {color: "#0000ff"};
        }
    }
}).addTo(mymap);

var geojsonMarkerOptions = {
    radius: 8,
    fillColor: "#ff7800",
    color: "#000",
    weight: 1,
    opacity: 1,
    fillOpacity: 0.8
};

//creates a geojson layer holding points
L.geoJSON(geojsonFeature, {
    pointToLayer: function (feature, latlng) {
        return L.circleMarker(latlng, geojsonMarkerOptions); //creates a circle shaped marker
    }
}).addTo(mymap);

function onEachFeature(feature, layer) {
    // does this feature have a property named popupContent?
    if (feature.properties && feature.properties.popupContent) {
        layer.bindPopup(feature.properties.popupContent);
    }
}

var geojsonFeature = {
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "amenity": "Baseball Stadium",
        "popupContent": "This is where the Rockies play!"
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
};

//creates a new geojson layer for features
L.geoJSON(geojsonFeature, {
    onEachFeature: onEachFeature
}).addTo(mymap);

var someFeatures = [{
    "type": "Feature",
    "properties": {
        "name": "Coors Field",
        "show_on_map": true
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.99404, 39.75621]
    }
}, {
    "type": "Feature",
    "properties": {
        "name": "Busch Field",
        "show_on_map": false
    },
    "geometry": {
        "type": "Point",
        "coordinates": [-104.98404, 39.74621]
    }
}];

//creates another geojson layer holding the features outlined above
L.geoJSON(someFeatures, {
    filter: function(feature, layer) {
        return feature.properties.show_on_map;
    }
}).addTo(mymap);