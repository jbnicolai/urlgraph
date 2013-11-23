var Crawler = require("crawler").Crawler;

var base = "http://essentials.xebia.com";
var vertices = [];
var edges = [];

var i;

var c = new Crawler({
  "maxConnections": 10,
  "callback": function (error, result, $) {
    var source = result.uri;
    if (vertices.indexOf(source === -1)) {
      vertices.push(result.uri);
    }
    $("a").each(function (i, a) {
      if (a.href.indexOf(base) === 0) {
        var dest = a.href;
        if (vertices.indexOf(dest) === -1) {
          vertices.push(dest);
          c.queue(dest);
        }
        edges.push({
          "source": vertices.indexOf(source),
          "target": vertices.indexOf(dest),
          "value": 1
        });
      }
    });
  },
  "onDrain": function () {
    for (var i in vertices) vertices[i] = {"group": 1, "name": vertices[i].substring(base.length)};
    console.log(JSON.stringify({nodes: vertices, links: edges}));
  }
});

c.queue(base);
