//Andrea Eibergen
//February 7, 2017
//Internet Use Map

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())

//function to create the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 0],
        zoom: 2,
        layers: [google, microsoft, facebook, yahoo]
    });

    //add Open Street Maps base tilelayer.addTo(map)r
     L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

     //call getData function
     getData(map);

     //add overlay layers
     L.control.layers(null, overlayMaps).addTo(map);
};

//calculate the radius of each proportional symbol
function calcPropRadius(attValue) {
    //scale factor to adjust symbol size evenly
    var scaleFactor = 10;
    //area based on attribute value and scale factor
    var area = attValue * scaleFactor;
    //radius calculated based on area
    var radius = Math.sqrt(area/Math.PI);

    return radius;
};

//3. Add circle markers for point features to the map--done (in AJAX callback)
//function to convert markers to circle markers
function pointToLayer(feature, latlng, attributes){
    //Step 4: Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];
    //check
    console.log(attribute);

    //create marker options
    var options = {
        fillColor: "#09bbf2",
        //used #ff7800 before (orange)
        color: "#000",
        weight: .5,
        opacity: 1,
        fillOpacity: 0.8
    };

    //5. For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //6. Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    //create circle marker layer
    var layer = L.circleMarker(latlng, options);
    layer.bindPopup(popupContent);

    //event listeners to open popup on hover
    layer.on({
        mouseover: function(){
            this.openPopup();
        },
        mouseout: function(){
            this.closePopup();
        }
    });

    //build popup content string starting with country
    var popupContent = "<p><b>Country:</b> " + feature.properties.Country + "</p>";

    //add formatted attribute to popup content string
    //for loop to cut off unneccesary information [within brackets]
    for (i=0; i<=25; i++) {
        var year = attribute.replace(/ *\[[^)]*\] */g, "");
    }
    //creates string in popup to tell the user what they are looking at
    popupContent += "<p><b>Internet Users in " + year + ":</b> " + feature.properties[attribute] + " %</p>";

    //bind the popup to the circle marker
    layer.bindPopup(popupContent);

    //return the circle marker to the L.geoJson pointToLayer option
    return layer;
};

//Add circle markers for point features to the map
function createPropSymbols(data, map, attributes){
    //create a Leaflet GeoJSON layer and add it to the map
    L.geoJson(data, {
        pointToLayer: function(feature, latlng){
            return pointToLayer(feature, latlng, attributes);
        }
    }).addTo(map);
};

//Step 2: Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/InternetUsage.geojson", {
        dataType: "json",
        success: function(response){
            //call function to create proportional symbols
            createPropSymbols(reference, map);
        }
    });
};


//GOAL: Allow the user to sequence through the attributes and resymbolize the map 
//   according to each attribute

//Step 1: Create new sequence controls
function createSequenceControls(map, attributes){
    //create range input element (slider)
      $('#mydiv').append('<input class="range-slider" type="range">');

    //Step 5: click listener for buttons
   $('.skip').click(function(){
        //get the old index value
        var index = $('.range-slider').val();

        //Step 6: increment or decrement depending on button clicked
        if ($(this).attr('id') == 'forward'){
            index++;
            //Step 7: if past the last attribute, wrap around to first attribute
            index = index > 25 ? 0 : index;
        } else if ($(this).attr('id') == 'reverse'){
            index--;
            //Step 7: if past the first attribute, wrap around to last attribute
            index = index < 0 ? 25 : index;
        };

        //Step 8: update slider
        $('.range-slider').val(index);
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
    });
    //Step 5: input listener for slider
    $('.range-slider').on('input', function(){
        //Step 6: get the new index value
        var index = $(this).val();
        //Step 9: pass new attribute to update symbols
        updatePropSymbols(map, attributes[index]);
        console.log(index);
    });

    //set slider attributes
    $('.range-slider').attr({
        max: 25,
        min: 0,
        value: 0,
        step: 1
    });
};

//add skip buttons
    $('#mydiv').append('<button class="skip" id="reverse">Reverse</button>');
    $('#mydiv').append('<button class="skip" id="forward">Skip</button>');

    // //commented out until I can correctly format the images(25*25 px)
    // //replace button content with images
    // $('#reverse').html('<img src="img/reverse.png">');
    // $('#forward').html('<img src="img/forward.png">');

//Import GeoJSON data
function getData(map){
    //load the data
    $.ajax("data/InternetUsage.geojson", {
        dataType: "json",
        success: function(response){
            //create an attributes array
            var attributes = processData(response);

            createPropSymbols(response, map, attributes);
            createSequenceControls(map, attributes);

        }
    });
};

//3. Create an array of the sequential attributes to keep track of their order
function processData(data){
    //empty array to hold attributes
    var attributes = [];

    //properties of the first feature in the dataset
    var properties = data.features[0].properties;

    //push each attribute name into attributes array
    for (var attribute in properties){
        //only take attributes with internet use values
        if (attribute.indexOf("YR") > -1){
            attributes.push(attribute);
        };
    };

    //check result
    console.log(attributes);

    return attributes;
};

//Step 10: Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
       if (layer.feature ){
            //access feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add country to popup content string
            var popupContent = "<p><b>Country:</b> " + props.Country + "</p>";

            //add formatted attribute to mydiv content string
            //for loop to cut off unneccesary information [within brackets]
            for (i=0; i<=25; i++) {
                var year = attribute.replace(/ *\[[^)]*\] */g, "");
            }
            //creates string to tell user which data they are looking at
            popupContent += "<p><b>Internet Users in " + year + ":</b> " + props[attribute] + " %</p>";

            //replace the layer popup
            layer.bindPopup(popupContent, {
                offset: new L.Point(0,-radius)
            });
        };
    });
};

//fifth operator

//numerous data center locations to add to map from google
var BerkleyCounty = L.marker([33.1976318, -79.9513321]);
    CouncilBluffs = L.marker([41.2577515, -95.8512115]);
    DouglasCounty = L.marker([33.70084, -84.7678223]);
    JacksonCounty = L.marker([34.7794304, -85.9992905]);
    Lenoir = L.marker([35.915329, -81.5400925]);
    MayesCounty = L.marker([36.3018112, -95.2308807]);
    MontgomeryCounty = L.marker([36.4968796, -87.3829269]);
    PryorCreek = L.marker([36.3069611, -95.3137817]);
    TheDalles = L.marker([45.6015511, -121.1834335]);
    Quilicura = L.marker([-33.3515015, -70.7350998]);
    SaintGhislain = L.marker([50.4432983, 3.81304]);
    Hamina = L.marker([60.5620995, 27.2311993]);
    Dublin = L.marker([53.3330994, -6.2488899]);
    Eemshaven = L.marker([53.4427986, 6.81599]);
    JurongWest = L.marker([1.3499, 103.7278671]);
    ChanghuaCouty = L.marker([24.0848408, 120.5416565]);

//combines markers into one layer
var google = L.layerGroup([BerkleyCounty, CouncilBluffs, DouglasCounty, JacksonCounty, Lenoir, MayesCounty, MontgomeryCounty, PryorCreek, TheDalles, Quilicura, SaintGhislain, Hamina, Dublin, Eemshaven, JurongWest, ChanghuaCouty]);

//numerous data center locations to add to map from microsoft
var Quincy = L.marker([47.2374802, -119.8533783]);
    SanAntonio = L.marker([29.4245796, -98.4946136]);
    Chicago = L.marker([41.8842506, -87.6324463]);
    Amsterdam = L.marker([52.3306999, 4.86654]);
    Dublin = L.marker([53.3330994, -6.2488899]);
    HongKong = L.marker([22.3361568, 114.1869659]);
    Osaka = L.marker([34.6775208, 135.5129089]);
    Saitama = L.marker([35.8659134, 139.6446075]);
    Victoria = L.marker([-36.8642502, 144.3103638]);

//combines markers into one layer
var microsoft = L.layerGroup([Quincy, SanAntonio, Chicago, Amsterdam, Dublin, HongKong, Osaka, Saitama, Victoria]);

//numerous data center locations to add to map from facebook
var Prineville = L.marker([44.3029213, -120.8440399]);
    Altoona = L.marker([41.6440582, -93.4588013]);
    ForestCity = L.marker([35.3337593, -81.8647385]);
    Luleå = L.marker([65.5858002, 22.1574001]);

//combines markers into one layer
var facebook = L.layerGroup([Prineville, Altoona, ForestCity, Luleå]);

//numerous data center locations to add to map from yahoo
var Quincy = L.marker([47.2374802, -119.8533783]);
    Omaha = L.marker([41.2606888, -95.9405899]);
    Lockport = L.marker([43.1691895, -78.6953735]);

//combines markers into one layer
var yahoo = L.layerGroup([Quincy, Omaha, Lockport]);

var overlayMaps = {
    "Google": google,
    "Microsoft": microsoft,
    "Facebook": facebook,
    "Yahoo": yahoo
};

$(document).ready(createMap);