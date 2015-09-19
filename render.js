

function sample(threads, m, beginningOfTime, endOfTime){


  threads.forEach(function(thread){
    thread.messages.sort(function(a, b){
      var ta = new Date(a.date).getTime();
      var tb = new Date(b.date).getTime();
      return ta - tb;
    });
  });

  return threads.map(function(thread, j){
    samples = []
    var msgIdx = 0
    for (var i = 1; i <= m; i++){
      var sample = -1;
      do {
        sample += 1;
        var msg = thread.messages[msgIdx];
        msgIdx += 1
        if (msg != null)
          var sampleMakesItIn = new Date(msg.date).getTime() <= beginningOfTime + (endOfTime - beginningOfTime)*i/m;
        else
          var sampleMakesItIn = false;
      } while (sampleMakesItIn);
      msgIdx -= 1;
      samples.push(sample)
    }
    return {
      samples: samples
    }
  });
}

function render(threads){
    //var n = 20, // number of layers
    //    m = 200, // number of samples per layer
    //    stack = d3.layout.stack().offset("wiggle"),
    //    layers0 = stack(d3.range(n).map(function() { return bumpLayer(m); })),
    //    layers1 = stack(d3.range(n).map(function() { return bumpLayer(m); }));

    var m = 100;

    var stack = d3.layout.stack().offset("wiggle");
    //var layers0 = stack(d3.range(10).map(function() { return bumpLayer(m); }));

    allMsgTimes = [].concat.apply([], threads.map(function(thread){
      return thread.messages.map(function(msg){
        return new Date(msg.date).getTime();
      });
    }));

    var beginningOfTime = Math.min.apply(null, allMsgTimes);
    var endOfTime = Math.max.apply(null, allMsgTimes);
    console.log((endOfTime - beginningOfTime)/(3600*24*365*1000));

    var layers0 = stack(sample(threads, m, beginningOfTime, endOfTime).map(function(thread){
      var layer = [];
      for (var i = 0; i < thread.samples.length; i++){
        layer.push({ x: i, y: thread.samples[i]});
      }
      return layer;
    }));
    var layers1 = layers0

    //var width = $('.graph').offsetWidth;
    //var height = $('.graph').offsetHeight;
    var width = 2000;
    var height = 1500;

    var x = d3.scale.linear()
        .domain([0, m - 1])
        .range([0, width]);

    var y = d3.scale.linear()
        .domain([0, d3.max(layers0.concat(layers1), function(layer) { return d3.max(layer, function(d) { return d.y0 + d.y; }); })])
        .range([height, 0]);

    //var color = d3.scale.linear().range(["#aad", "#556"]);
    var color = d3.scale.category20()

    var area = d3.svg.area()
        .x(function(d) { return x(d.x); })
        .y0(function(d) { return y(d.y0); })
        .y1(function(d) { return y(d.y0 + d.y); });

    var svg = d3.select(".graph").append("svg")
        .attr("viewBox", "0 0 2000 1500")
        .attr("preserveAspectRatio", "none");

    //var tooltip = d3.select("body")
    //  .append("div")
    //  .style("position", "absolute")
    //  .style("z-index", "10")
    //  .style("visibility", "hidden")
    //  .text("a simple tooltip");

    function refreshTooltip(idx, event){
      var rect = document.querySelector('.graph').getBoundingClientRect()
      time = beginningOfTime + (event.pageX-rect.left)/rect.width*(endOfTime - beginningOfTime)
      var date = new Date(time);
      var monthNames = [
        "January", "February", "March",
        "April", "May", "June", "July",
        "August", "September", "October",
        "November", "December"
      ];

      var dateStr = monthNames[date.getMonth()] + ' ' + date.getDate() + ' ' + date.getFullYear();
      $('.tooltip').text(threads[idx].people + ' | ' + dateStr);
    }

    svg.selectAll("path")
        .data(layers0)
        .enter().append("path")
        .attr("d", area)
        .on("mouseover", function(_, idx, _){
          refreshTooltip(idx, event);
          //return tooltip.style("visibility", "visible");
        })
	      //.on("mousemove", function(_, idx, _){refreshTooltip(idx, event); return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
	      //.on("mouseout", function(){return tooltip.style("visibility", "hidden");})
	      .on("mousemove", function(_, idx, _){ refreshTooltip(idx, event); })
	      .on("mouseout", function(){ $('.tooltip').text(''); })
        .style("fill", function() { return color(Math.random()); });

    function transition() {
      d3.selectAll("path")
          .data(function() {
            var d = layers1;
            layers1 = layers0;
            return layers0 = d;
          })
        .transition()
          .duration(2500)
          .attr("d", area);
    }

    // Inspired by Lee Byron's test data generator.
    function bumpLayer(n) {

      function bump(a) {
        var x = 1 / (.1 + Math.random()),
            y = 2 * Math.random() - .5,
            z = 10 / (.1 + Math.random());
        for (var i = 0; i < n; i++) {
          var w = (i / n - y) * z;
          a[i] += x * Math.exp(-w * w);
        }
      }

      var a = [], i;
      for (i = 0; i < n; ++i) a[i] = 0;
      for (i = 0; i < 5; ++i) bump(a);
      return a.map(function(d, i) { return {x: i, y: Math.max(0, d)}; });
    }

}
