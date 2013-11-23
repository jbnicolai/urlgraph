d3.json("graph.json", render);

var margin = {top: 50, right: 120, bottom: 50, left: 120},
    width = screen.width - margin.right - margin.left,
    height = screen.height - margin.top - margin.bottom,
    color = d3.scale.category20(),
    svg = d3.select("body").append("svg")
      .attr("width", width + margin.right + margin.left)
      .attr("height", height + margin.top + margin.bottom)
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    force = d3.layout.force()
      .distance(100)
      .charge(-30)
      .size([width, height])
      .on("tick", tick),
    node = [],
    link = [],
    linkedByI = {};

function render (json) {
  force.nodes(json.nodes)
    .links(json.links)
    .start();
  link = svg.selectAll(".link")
    .data(json.links)
    .enter()
    .append("line")
    .attr("class", "link");
  node = svg.selectAll(".node")
    .data(json.nodes)
    .enter().append("g")
    .attr("class", "node")
    .on("mouseover", mouseover)
    .on("mouseout", mouseout)
    .call(force.drag);
  node.append("circle", ".cursor")
    .attr("r", "5")
    .style("fill", function (d) { return color(d.group); });
  link.each(function (d) {
    linkedByI[d.source.index + "," + d.target.index] = 1;
    linkedByI[d.target.index + "," + d.source.index] = 1;
  });
}

var active_node = {};

function mouseover (d) {
  active_node = d;
  redraw();
}

function redraw () {
  if (active_node) redrawActive();
  else redrawInactive();
}

function redrawActive () {
  active = node.filter(isInGroup(active_node));
  inactive = node.filter(function (o) { return !isInGroup(active_node)(o); });
  inactive.style("opacity", 0.1);
  inactive.select("text").remove();
  active.style("opacity", 1);
  active.append("text")
    .classed('info', true)
    .attr('x', 20)
    .attr('y', 10)
    .text(function (d) { return d.name; });
  link.style("opacity", function (l) {
    return (l.source.index === active_node.index || l.target.index === active_node.index) ? 1 : 0.1;
  });
}

function redrawInactive () {
  node.select("text").remove();
  node.style("opacity", 1);
  link.style("opacity", 1);
}

function mouseout (d) {
  active_node = null;
  redraw();
}

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
    .attr("y1", function(d) { return d.source.y; })
    .attr("x2", function(d) { return d.target.x; })
    .attr("y2", function(d) { return d.target.y; });
  node.attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; });
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
