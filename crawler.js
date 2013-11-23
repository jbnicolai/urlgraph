var Crawler = require("crawler").Crawler;

// options:
var base = "http://essentials.xebia.com";
var includeExternalLinks = false;

// walk any edge connected to a vertex on the domain
function shouldTraverseEdge (source, href) {
  return includeExternalLinks ? source.indexOf(base) === 0 : href.indexOf(base) === 0;
}

// consider any vertex not on the domain a leaf
function isLeaf (source) {
  return source.indexOf(base) !== 0;
}

// handle sigint gracefully
process.on( 'SIGINT', onFinishCrawl);

var V = [base], E = [];

// refer to vertices by index
function getVertexIndex (href) {
  var v = V.indexOf(href);
  if (v === -1) {
    v = V.length;
    V.push(href);
    if (!isLeaf(href)) {
      c.queue(href);
    }
  }
  return v;
}

function onFetchPage (error, page, $) {
  if (error) return;
  var v1 = getVertexIndex(page.uri);
  $("a").each(function (_, a) {
    if (shouldTraverseEdge(page.uri, a.href)) {
      E.push({v1: v1, v2: getVertexIndex(a.href)});
    }
  });
}

function onFinishCrawl () {
  console.log(JSON.stringify(createD3jsObject()));
  process.exit();
}

var c = new Crawler({
  "maxConnections": 25,
  "callback": onFetchPage,
  "onDrain": onFinishCrawl
});

c.queue(base);

function createD3jsObject () {
  // d3js expects:
  // { "nodes": [{ name: "", group "" }], "links": [{ source: i, target i, value factor }]}
  // group urls on the same domain
  var d3js = { nodes: [], links: []};

  for (var i in V) {
    var v = V[i];
    d3js.nodes.push({
      name: v,
      group: group(v)
    });
  }

  for (var i in E) {
    var e = E[i];
    d3js.links.push({
      source: e.v1,
      target: e.v2,
      left: false,
      right: true
    });
  }

  return d3js;
}

function group (uri) {
  return uri.indexOf(base) === 0 ? 0 :
    uri.indexOf("linkedin") !== -1 ? 1 :
    uri.indexOf("facebook") !== -1 ? 2 :
    uri.indexOf("plus.google") !== -1 ? 3 :
    uri.indexOf("twitter") !== -1 ? 4 :
    5;
}
