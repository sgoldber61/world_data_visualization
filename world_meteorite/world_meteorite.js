// Used https://gist.github.com/d3noob/5193723/raw/world-110m2.json as a source for the world map.

var scaleFactor = 1.5;
var boundsFactor = 1.5;
var width = 960 * boundsFactor,
    height = 600 * boundsFactor;

var projection;
projection = d3.geo.mercator()
  .scale(150 * scaleFactor)
  .center([0, 0])
  .translate([width / 2, height / 2])
  .rotate([0, 0]);

var svg;
svg = d3.select("body").append("svg")
  .attr("width", width)
  .attr("height", height);

// path generator, used to define the "d" attribute for the svg path elements for drawing the countries.
var path;
path = d3.geo.path()
  .projection(projection);

var g = svg.append("g");

// load and display the World
$.getJSON("https://cors-anywhere.herokuapp.com/https://gist.github.com/d3noob/5193723/raw/world-110m2.json", loadWorld);

function loadWorld(topology) {
  g.selectAll("path")
    .data(topojson.object(topology, topology.objects.countries)
          .geometries)
    .enter()
    .append("path")
    .attr("d", path);

  // load and display the meteorite data
  $.getJSON("https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/meteorite-strike-data.json", function(json) {
    loadMeteorite.call(g, json);
  });
}

function loadMeteorite(json) {
  // initial processing of meteorite data
  var data = json.features;

  // parse strings into numbers
  data.forEach(function(d) {
    d.properties.mass = parseFloat(d.properties.mass); // returns NaN for null mass
  });

  // sort mass values descending, so that the biggest masses are in back
  data.sort(function(d1, d2) {
    var mass1 = d1.properties.mass;
    var mass2 = d2.properties.mass;

    if (isNaN(mass1)) {
      if (isNaN(mass2)) {
        // if both not a number, equal
        return 0;
      }

      return 1;
    }
    else if (isNaN(mass2)) {
      return -1;
    }

    return mass2 - mass1;
  });

  // color scale
  var ordinalColorScale = d3.scale.category20();

  // load meteorite data into the map as svg circles

  this.selectAll("point")
    .data(data)
    .enter()
    .append("circle")
    .classed("point", true)
    .attr("cx", function(d, i) {
    if (d.geometry == null)
      return null;

    return projection(d.geometry.coordinates)[0];
  })
    .attr("cy", function(d, i) {
    if (d.geometry == null)
      return null;

    return projection(d.geometry.coordinates)[1];
  })
    .attr("r", function(d, i) {

    // Some of the numbers for the radius code was suggested from https://codepen.io/freeCodeCamp/pen/mVEJag
    var range = 179687.5 / 2;
    var r = d.properties.mass;

    if (isNaN(r)) return 1;
    else if (r <= range / 10) return 1.5;
    else if (r <= range) return 2;
    else if (r <= range * 1.33) return 4.5;
    else if (r <= range * 1.78) return 7;
    else if (r <= range * 3.16) return 12;
    else if (r <= range * 5.62) return 17;
    else if (r <= range * 10) return 22;
    else if (r <= range * 10 * 1.78) return 27;
    else if (r <= range * 10 * 3.16) return 32;
    else if (r <= range * 10 * 5.62) return 37;
    else if (r <= range * 100) return 42;
    return 47;
  })
    .style("fill", function(d, i) {
    return ordinalColorScale(i);
  })
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut);

  function mouseOver(d, i) {
    // tooltip change
    var coords = d3.mouse(this);

    var transform = "translate(" + (coords[0] + 100 + parseInt($("svg").offset().left, 10)) + "px," + (coords[1] + parseInt($("svg").offset().top, 10)) + "px)";
    
    var html = d.properties.name + ": " + d.properties.year.slice(0, 4) + "</br>" +
        "Mass: " + d.properties.mass + "</br>" +
        "recclass: " + d.properties.recclass;
    
    $(".tooltip")
      .css({
      transform: transform
    })
      .html(html);
  }

  function mouseOut(d, i) {
    // tooltip change

    $(".tooltip")
      .html("");
  }
}

