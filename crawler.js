var Crawler = require("crawler").Crawler;

// options:
var base = "http://essentials.xebia.com";
var includeExternalLinks = true;

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
  console.log("source,target" + (includeExternalLinks ? ",external" : ""));
  for (var i in E) {
    var e = E[i];
    console.log(V[e.v1] + "," + V[e.v2] + (includeExternalLinks ? ("," + isLeaf(V[e.v2])) : ""));
  }
  process.exit();
}

var c = new Crawler({
  "maxConnections": 25,
  "callback": onFetchPage,
  "onDrain": onFinishCrawl
});

c.queue(base);
