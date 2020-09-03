
// set the dimensions and margins of the graph
var margin = {top: 0, right: 0, bottom: 0, left: 0},
  width = 1500 - margin.left - margin.right,
  height = 1500 - margin.top - margin.bottom;

// append the svg object to the body of the page
var svg = d3.select("#chart")
.append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
.append("g")
  .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

d3.json("network-data.json", function( data) {

  // Initialize the links
  var link = svg
    .selectAll("line")
    .data(data.links)
    .enter()
    .append("line")
      .style("stroke", "#aaa")
      .style("stroke-opacity", "0.5")
      .style("stroke-width", function(d) {return d.value*3;})
      .attr("class", function(d) { return "e"+d.source + " e" + d.target;})

  // Initialize the nodes
  var node = svg
    .selectAll("circle")
    .data(data.nodes)
    .enter()
    .append("circle")
      .attr("r", 20)
      .attr("id", function(d){return d.id;})
      .style("fill", function(d) { return d3.schemeCategory10[d.nodeType];})
      .on("mouseover", handleMouseOver)
      .on("mouseout", handleMouseOut)

  var nodeNames = svg.selectAll("text")
      .data(data.nodes)
      .enter()
      .append("text")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .attr("font-variant", "small-caps")
        .text(function(d) {return d.name;})

  // Let's list the force we wanna apply on the network
  var simulation = d3.forceSimulation(data.nodes)                 // Force algorithm is applied to data.nodes
      .force("link", d3.forceLink()                               // This force provides links between nodes
            .id(function(d) { return d.id; })                     // This provide  the id of a node
            .links(data.links)                                    // and this the list of links
      )
//      .force("link", d3.forceLink(link).id(d => d.id))
      .force("charge", d3.forceManyBody().strength(-50))         // This adds repulsion between nodes. Play with the -400 for the repulsion strength
      .force("center", d3.forceCenter(width / 2, height / 2))     // This force attracts nodes to the center of the svg area
      .force("collision", d3.forceCollide(30))
      .on("tick", ticked)
      .on("end", ticked);

  // This function is run at each iteration of the force algorithm, updating the nodes position.
  function ticked() {
    link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node
         .attr("cx", function (d) {  return d.x+6; })
         .attr("cy", function(d) { return d.y-6; });

    nodeNames
        .attr("x", function(d) {return d.x + 6;})
        .attr("y", function(d) {return d.y - 6;})
  }

  function handleMouseOver(d,i) {
    // hide away all nodes
    d3.selectAll("circle").style("opacity", "0.1")
    d3.selectAll("line").style("stroke-opacity", "0.1")

    // highlight all connected nodes:
    var myId = this.id
    var linksOfMine = d3.selectAll(".e" + myId)
    for (i=0; i<linksOfMine._groups[0].length; i++) {
        targetId = linksOfMine._groups[0][i].attributes["class"].nodeValue.split(" ").filter(function(d) {return d != "e" + myId;})[0];
        targetId = targetId.replace("e", "")
        d3.selectAll('[id="'+targetId+'"]').style("opacity", "1")
    }

    linksOfMine.style("stroke-opacity", "1.0")
    d3.select('[id="'+this.id+'"]').style("opacity", "1")

  }

  function handleMouseOut(d,i) {
      d3.selectAll("circle").style("opacity", "1")
      d3.selectAll("line").style("stroke-opacity", "1")
  }

});
