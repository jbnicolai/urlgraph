d3.csv("edges.csv", function(error, links) {
  var nodes = {};
  var linkedByI = {};
  var color = d3.scale.category10();

  // Compute the distinct nodes from the links.
  links.forEach(function(link) {
    link.source = nodes[link.source] ||
      (nodes[link.source] = {name: link.source, external: false});
    link.target = nodes[link.target] ||
      (nodes[link.target] = {name: link.target, external: link.external === 'true'});
  });

  var width = 960,
      height = 700;

  var force = d3.layout.force()
      .nodes(d3.values(nodes))
      .links(links)
      .size([width, height])
      .linkDistance(80)
      .charge(-300)
      .on("tick", tick)
      .start();

  var svg = d3.select("body").append("svg")
      .attr("width", width)
      .attr("height", height);

  // build the arrow.
  svg.append("svg:defs").selectAll("marker")
      .data(["end"])      // Different link/path types can be defined here
    .enter().append("svg:marker")    // This section adds in the arrows
      .attr("id", String)
      .attr("viewBox", "0 -5 10 10")
      .attr("refX", 15)
      .attr("refY", -1.5)
      .attr("markerWidth", 6)
      .attr("markerHeight", 6)
      .attr("orient", "auto")
    .append("svg:path")
      .attr("d", "M0,-5L10,0L0,5");

  // add the links and the arrows
  var path = svg.append("svg:g").selectAll("path")
      .data(force.links())
    .enter().append("svg:path")
      .attr("class", "link")
      .attr("marker-end", "url(#end)");

  path.each(function (d) {
    linkedByI[d.source.index + "," + d.target.index] = 1;
    linkedByI[d.target.index + "," + d.source.index] = 1;
  });

  // define the nodes
  var node = svg.selectAll(".node")
      .data(force.nodes())
    .enter().append("g")
      .attr("class", "node")
      .call(force.drag)
      .on("mouseover", mouseover)
      .on("mouseout", mouseout);

  // add the nodes
  node.append("circle")
      .attr("r", 5)
      .style("fill", function (d) {
        return d.external ? color(2) : color(8);
      });

  // add the curvy lines
  function tick() {
    path.attr("d", function(d) {
      var dx = d.target.x - d.source.x,
      dy = d.target.y - d.source.y,
      dr = Math.sqrt(dx * dx + dy * dy);
    return "M" +
      d.source.x + "," +
      d.source.y + "A" +
      dr + "," + dr + " 0 0,1 " +
      d.target.x + "," +
      d.target.y;
    });
    node.attr("transform", function(d) {
      return "translate(" + d.x + "," + d.y + ")";
    });
  }

  var activeNode = null;

  function mouseover (d) {
    activeNode = d;
    redraw();
  }

  function mouseout () {
    activeNode = null;
    redraw();
  }

  function redraw () {
    if (activeNode) redrawActive();
    else redrawInactive();
  }

  function redrawActive () {
    active = node.filter(isInGroup(activeNode));
    inactive = node.filter(function (o) { return !isInGroup(activeNode)(o); });
    inactive.style("opacity", 0.1);
    inactive.select("text").remove();
    active.style("opacity", 1);
    active.append("text")
      .classed('info', true)
      .attr('x', 20)
      .attr('y', 10)
      .text(function (d) { return d.name; });
    path.style("opacity", function (l) {
      return (l.source.index === activeNode.index || l.target.index === activeNode.index) ? 1 : 0.1;
    });
  }

  function redrawInactive () {
    node.select("text").remove();
    node.style("opacity", 1);
    path.style("opacity", 1);
  }

  function isInGroup (a) {
    return function (b) {
      return a.index === b.index || neighbouring(a, b);
    };
  }

  Array.prototype.diff = function (a) {
    return this.filter(function(i) { return a.indexOf(i) > 0; });
  };

  function neighbouring (a, b) {
    return linkedByI[a.index + "," + b.index];
  }
});
