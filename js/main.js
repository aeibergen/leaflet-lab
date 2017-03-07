//Andrea Eibergen
//February 7, 2017
//Internet Use Map
//all icons from icons8.com

//GOAL: Proportional symbols representing attribute values of mapped features
//STEPS:
//1. Create the Leaflet map--done (in createMap())

//function to create the Leaflet map
function createMap(){
    //create the map
    var map = L.map('mapid', {
        center: [20, 0],
        zoom: 2,
        maxBounds:[
            [70, 176],
            [-48, -130]
        ],
    });

    //add Open Street Maps base tilelayer.addTo(map)
     L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="http://cartodb.com/attributions">CartoDB</a> &copy; <a href="http://data.worldbank.org/indicator/IT.NET.USER.P2">Data: The World Bank</a>',
    subdomains: 'abcd',
    maxZoom: 19
}).addTo(map);

     //call getData function
     getData(map);

     //add overlay layers
     L.control.layers(null, overlayMaps).addTo(map);

};

function createPopup(properties, attribute, layer, radius){
    //add city to popup content string
    var popupContent = "<p><b>Country:</b> " + properties.Country + "</p>";

    //add formatted attribute to panel content string
    for (i=0; i<=25; i++) {
        var year = attribute.replace(/ *\[[^)]*\] */g, "");
    }
    popupContent += "<p><b>Internet Users in " + year + ":</b> " + properties[attribute] + " %</p>";

    //replace the layer popup
    layer.bindPopup(popupContent, {
        offset: new L.Point(0,-radius)
    });
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
    //Assign the current attribute based on the first index of the attributes array
    var attribute = attributes[0];

    //create marker options
    var options = {
        fillColor: "#09bbf2",
        color: "#000",
        weight: .5,
        opacity: 1,
        fillOpacity: 0.8
    };

    //For each feature, determine its value for the selected attribute
    var attValue = Number(feature.properties[attribute]);

    //Give each feature's circle marker a radius based on its attribute value
    options.radius = calcPropRadius(attValue);

    // //create circle marker layer
     var layer = L.circleMarker(latlng, options);
    // layer.bindPopup(popupContent);

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
    createPopup(feature.properties, attribute, layer, options.radius);
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

//Import GeoJSON data
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


//Allow the user to sequence through the attributes and resymbolize the map according to each attribute
//create new sequence control
function createSequenceControls(map, attributes){
    var SequenceControl=L.Control.extend({
        options:{
            position:"bottomleft"
        },
        
        onAdd:function(map){
            //create the control container div with a a particular class name
            var container=L.DomUtil.create("div","sequence-control-container");
            
            //create range input element (slider)
            $(container).append('<input class="range-slider" type="range">');
            
            //add skip buttons
            $(container).append('<button class="skip" id="reverse" title="Reverse">Reverse</button>');
            $(container).append('<button class="skip" id="forward" title="Forward">Skip</button>');
            
            //kill any mouse event listeners on the map
            $(container).on('mousedown dblclick',function(e){
                L.DomEvent.stopPropagation(e);
            });
            return container;
        }
    });
    map.addControl(new SequenceControl());

    //set slider attributes
    $(".range-slider").attr({
        max:25,
        min:0,
        value:0,
        step:1
    });

    //replace button contents with images
    $("#reverse").html("<img src='img/rewinda.png'>");
    $("#forward").html("<img src='img/forwarda.png'>");
    
    //click listener for buttons
    $(".skip").click(function(){
        //get the old index value
        var index=$(".range-slider").val();
        
        //increment or decrement depending on the button clicked
        if ($(this).attr("id")=="forward"){
            index++;
            //if past the last attribute, wrap around to the first attribute
            index= index > 25 ? 0 : index;
        } else if ($(this).attr("id")=="reverse"){
            index--;
            //if past the first attribute, wrap around to the last attribute
            index= index < 0 ? 25 : index;
        };
        
        //update slider
        $(".range-slider").val(index);
        
        //pass new attribute to update symbols
        updatePropSymbols(map,attributes[index]);
    });
    
    //input listener for slider
    $(".range-slider").on("input",function(){
        //get the new index value
        var index=$(this).val();
        
        //pass new attribute to update symbols
        updatePropSymbols(map,attributes[index]);
    });
};

//create temporal legend
function createLegend(map, attributes){
    var LegendControl = L.Control.extend({
        options: {
            position: 'bottomright'
        },

        onAdd: function (map) {
            // create the control container with a particular class name
            var container = L.DomUtil.create('div', 'legend-control-container');

            //add temporal legend div to container
            $(container).append('<div id="temporal-legend">')

            //Step 1: start attribute legend svg string
            var svg = '<svg id="attribute-legend" width="160px" height="60px">';

            //array of circle names to base loop on
            var circles = {
                max: 20,
                mean: 40,
                min: 60
            };
            //loop to add each circle and text to svg string
            for (var circle in circles){
                //circle string
                svg += '<circle class="legend-circle" id="' + circle + '" fill="#09bbf2" fill-opacity="0.8" stroke="#000000" cx="30"/>';

                //text string
                svg += '<text id="' + circle + '-text" x="65" y="' + circles[circle] + '"></text>';
            };

            //close svg string
            svg += "</svg>";

            //add attribute legend svg to container
            $(container).append(svg);

                return container;
        }
    });

    map.addControl(new LegendControl());

    updateLegend(map, attributes[0]);
};

//Update the legend with new attribute
function updateLegend(map, attribute){
    //create content for legend
    for (i=0; i<=25; i++) {
        var year = attribute.replace(/ *\[[^)]*\] */g, "");
    }
    var content = "Internet Use in " + year;

    //replace legend content
    $('#temporal-legend').html(content);
    //min values as an object
    var circleValues = getCircleValues(map, attribute);
        for (var key in circleValues){
        //get the radius
        var radius = calcPropRadius(circleValues[key]);

        //assign the cy and r attributes
        $('#'+key).attr({
            cy: 59 - radius,
            r: radius
        });
        //Step 4: add legend text
        $('#'+key+'-text').text(Math.round(circleValues[key]*100)/100 + " %");
    };
};

//Calculate the max, mean, and min values for a given attribute
function getCircleValues(map, attribute){
    //start with min at highest possible and max at lowest possible number
    var min = Infinity,
        max = -Infinity;

    map.eachLayer(function(layer){
        //get the attribute value
        if (layer.feature){
            var attributeValue = Number(layer.feature.properties[attribute]);

            //test for min
            if (attributeValue < min){
                min = attributeValue;
            };

            //test for max
            if (attributeValue > max){
                max = attributeValue;
            };
        };
    });

    //set mean
    var mean = (max + min) / 2;

    //return values as an object
    return {
        max: max,
        mean: mean,
        min: min
    };
};

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
            createLegend (map, attributes);

        }
    });
};

//Create an array of the sequential attributes to keep track of their order
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

//Resize proportional symbols according to new attribute values
function updatePropSymbols(map, attribute){
    map.eachLayer(function(layer){
       if (layer.feature){
            //access feature properties
            var props = layer.feature.properties;
            //update each feature's radius based on new attribute values
            var radius = calcPropRadius(props[attribute]);
            layer.setRadius(radius);

            //add country to popup content string
            createPopup(props, attribute, layer, radius);
            updateLegend(map, attribute);
        };
    });
};

//fifth operator

//creating differnet icon colors for different data center owners
var ColorIcon = L.Icon.extend({
    options: {
        iconSize: [20, 20],
    }
});

//setting the icons to the images used
var redIcon = new ColorIcon({iconUrl: "img/redMarker.png"}),
    purpleIcon = new ColorIcon({iconUrl: "img/purpleMarker.png"}),
    orangeIcon = new ColorIcon({iconUrl: "img/orangeMarker.png"}),
    greenIcon = new ColorIcon({iconUrl: "img/greenMarker.png"});

//numerous data center locations to add to map from google
var BerkleyCounty = L.marker([33.1976318, -79.9513321], {icon: redIcon});
    CouncilBluffs = L.marker([41.2577515, -95.8512115], {icon: redIcon});
    DouglasCounty = L.marker([33.70084, -84.7678223], {icon: redIcon});
    JacksonCounty = L.marker([34.7794304, -85.9992905], {icon: redIcon});
    Lenoir = L.marker([35.915329, -81.5400925], {icon: redIcon});
    MayesCounty = L.marker([36.3018112, -95.2308807], {icon: redIcon});
    MontgomeryCounty = L.marker([36.4968796, -87.3829269], {icon: redIcon});
    PryorCreek = L.marker([36.3069611, -95.3137817], {icon: redIcon});
    TheDalles = L.marker([45.6015511, -121.1834335], {icon: redIcon});
    Quilicura = L.marker([-33.3515015, -70.7350998], {icon: redIcon});
    SaintGhislain = L.marker([50.4432983, 3.81304], {icon: redIcon});
    Hamina = L.marker([60.5620995, 27.2311993], {icon: redIcon});
    Dublin = L.marker([53.3330994, -6.2488899], {icon: redIcon});
    Eemshaven = L.marker([53.4427986, 6.81599], {icon: redIcon});
    JurongWest = L.marker([1.3499, 103.7278671], {icon: redIcon});
    ChanghuaCouty = L.marker([24.0848408, 120.5416565], {icon: redIcon});

//combines markers into one layer
var google = L.layerGroup([BerkleyCounty, CouncilBluffs, DouglasCounty, JacksonCounty, Lenoir, MayesCounty, MontgomeryCounty, PryorCreek, TheDalles, Quilicura, SaintGhislain, Hamina, Dublin, Eemshaven, JurongWest, ChanghuaCouty]);

//numerous data center locations to add to map from microsoft
var Quincy = L.marker([47.2374802, -119.8533783], {icon: orangeIcon});
    SanAntonio = L.marker([29.4245796, -98.4946136], {icon: orangeIcon});
    Chicago = L.marker([41.8842506, -87.6324463], {icon: orangeIcon});
    Amsterdam = L.marker([52.3306999, 4.86654], {icon: orangeIcon});
    Dublin = L.marker([53.3330994, -6.2488899], {icon: orangeIcon});
    HongKong = L.marker([22.3361568, 114.1869659], {icon: orangeIcon});
    Osaka = L.marker([34.6775208, 135.5129089], {icon: orangeIcon});
    Saitama = L.marker([35.8659134, 139.6446075], {icon: orangeIcon});
    Victoria = L.marker([-36.8642502, 144.3103638], {icon: orangeIcon});

//combines markers into one layer
var microsoft = L.layerGroup([Quincy, SanAntonio, Chicago, Amsterdam, Dublin, HongKong, Osaka, Saitama, Victoria]);

//numerous data center locations to add to map from facebook
var Prineville = L.marker([44.3029213, -120.8440399], {icon: greenIcon});
    Altoona = L.marker([41.6440582, -93.4588013], {icon: greenIcon});
    ForestCity = L.marker([35.3337593, -81.8647385], {icon: greenIcon});
    Luleå = L.marker([65.5858002, 22.1574001], {icon: greenIcon});

//combines markers into one layer
var facebook = L.layerGroup([Prineville, Altoona, ForestCity, Luleå]);

//numerous data center locations to add to map from yahoo
var Quincy = L.marker([47.2374802, -119.8533783], {icon: purpleIcon});
    Omaha = L.marker([41.2606888, -95.9405899], {icon: purpleIcon});
    Lockport = L.marker([43.1691895, -78.6953735], {icon: purpleIcon});

//combines markers into one layer
var yahoo = L.layerGroup([Quincy, Omaha, Lockport]);

var overlayMaps = {
    "Google Data Centers (red)": google,
    "Microsoft Data Centers (orange)": microsoft,
    "Facebook Data Centers (green)": facebook,
    "Yahoo Data Centers (purple)": yahoo
};

$(document).ready(createMap);