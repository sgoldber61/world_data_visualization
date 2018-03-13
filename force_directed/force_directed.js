// get svg from dom
var svg = d3.select("svg");

// parameters

var w = parseInt(svg.attr("width"), 10);
var h = parseInt(svg.attr("height"), 10);

var margin = {
  top: 0,
  bottom: 0,
  left: 0,
  right: 0
};

var width = w - margin.left - margin.right;
var height = h - margin.top - margin.bottom;

// get flag container from dom
var flagContainer = d3.select(".flag-container");

// create title of graph
var titleDownshift = 40;
svg.append("text")
  .classed("graph-title", true)
  .attr("x", w / 2)
  .attr("y", titleDownshift)
  .attr("text-anchor", "middle")
  .text("Force Directed Graph of National Contiguity");

// create chart
var chart;
chart = svg.append("g")
  .classed("display", true)
  .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");


// define simulation physical laws
var simulation;
simulation = d3.forceSimulation()
  .force("link", d3.forceLink().id())
  .force("charge", d3.forceManyBody().strength(-25.0))
  .force("centerX", d3.forceX(width / 2).strength(0.015))
  .force("centerY", d3.forceY(height / 2).strength(0.015))
  .force("center", d3.forceCenter(width / 2, height / 2));

// a data source for neighboring countries.
$.getJSON("https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json", function(data) {
  // append linkElements to svg chart
  var linkElements;
  linkElements = chart.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line");

  // Flag sprites gifs laid onto html imgs
  // append nodeElements to flagContainer div
  // the only way the flag sprites work is if we add html imgs, not svg images
  var nodeElements;
  nodeElements = flagContainer.selectAll(".node")
    .data(data.nodes)
    .enter()
    .append("img")
    .attr("class", function(d, i) {
    return "flag flag-" + d.code;
  })
    .attr("height", "1px")
    .attr("width", "1px")
    .style("position", "absolute")
    .on("mouseover", mouseOver)
    .on("mouseout", mouseOut)
    .call(d3.drag()
          .on("start", dragstarted)
          .on("drag", dragged)
          .on("end", dragended));

  simulation
    .nodes(data.nodes)
    .on("tick", ticked);

  // relative strength of central force

  simulation.force("link", d3.forceLink().links(data.links).strength(1.0)); // default strength is 1.0

  function ticked() {
    // advance the linkElements and nodeElements as part of one step of the simulation.

    linkElements
      .attr("x1", function(d) {return d.source.x;})
      .attr("y1", function(d) {return d.source.y;})
      .attr("x2", function(d) {return d.target.x;})
      .attr("y2", function(d) {return d.target.y;});

    nodeElements
      .style("left", function(d) {return d.x + "px";})
      .style("top", function(d) {return d.y + "px";});

  }

  // mouseover and mouseout functions
  var tooltipUpshift = 30;
  function mouseOver(d, i) {
    // tooltip change
    var coords = d3.mouse(d3.select("svg").node());

    var left = (coords[0] + parseInt($("svg").offset().left, 10)) + "px";
    var top = (coords[1] + parseInt($("svg").offset().top, 10) - tooltipUpshift) + "px";
    var transform = "translate(" + "-50%," + "50%";
    
    $(".tooltip")
      .css({
      left: left,
      top: top,
      transform: transform
    })
      .html(d.country);
  }

  function mouseOut(d, i) {
    // tooltip change
    var coords = d3.mouse(this);

    $(".tooltip").text("");
  }
});

// drag functions

function dragstarted(d) {
  if (!d3.event.active)
    simulation.alphaTarget(0.3).restart();

  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active)
    simulation.alphaTarget(0);

  d.fx = null;
  d.fy = null;
}

