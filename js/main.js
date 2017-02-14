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
        zoom: 2
    });

    //add Open Street Maps base tilelaye.addTo(map)r
     L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

     //call getData function
     getData(map);
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

$(document).ready(createMap);