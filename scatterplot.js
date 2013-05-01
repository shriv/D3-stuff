// Basic canvas variables
WIDTH = 800;
HEIGHT = 550;
var margin = {t:30, r:300, b:20, l:40 },
	w = WIDTH - margin.l - margin.r ,
	h = HEIGHT - margin.t - margin.b,
	
	// setting output range
	x = d3.scale.linear().range([0, w]),
	y = d3.scale.linear().range([h - 60, 0]),
	
	//colors from a spectrum of 10 colours: #1f77b4 #ff7f0e #2ca02c #d62728 #9467bd #8c564b #e377c2 #7f7f7f #bcbd22 #17becf.
	color = d3.scale.category10();

var svg = d3.select("#chart").append("svg")
	.attr("width", w + margin.l + margin.r)
	.attr("height", h + margin.t + margin.b);

// set axes, as well as details on their ticks
var xAxis = d3.svg.axis()
	.scale(x)
	.ticks(10)
	.tickSubdivide(false)
	.tickSize(6, 3, 0)
	.orient("bottom");

var yAxis = d3.svg.axis()
	.scale(y)
	.ticks(10)
	.tickSubdivide(false)
	.tickSize(6, 3, 0)
	.orient("left");

// group that will contain all of the plots
var groups = svg.append("g").attr("transform", "translate(" + margin.l + "," + margin.t + ")");



// bring in the data, and do everything that is data-driven
d3.csv("publons.csv", function(data) {
	
// array of the journals, used for the legend
var journals = ["New Journal of Physics", "Journal of Applied Physics", "Physical Review B", "Physical Review Letters", "Nature"]

// sort data alphabetically by journal, so that the colors match with legend
data.sort(function(a, b) { return d3.ascending(a.journal, b.journal); })
console.log(data)
journals.sort(function(a, b) { return d3.ascending(a, b); })
console.log(journals)
for (var i = 0; i < journals.length; i++) {
    j = journals[i];
    console.log([j, color(j)]);
    //Do something
}


var x0 = Math.max(-d3.min(data, function(d) { return d.quality_score; }), d3.max(data, function(d) { return d.significance_score; }));
x.domain([1, 10]);
y.domain([1, 10])

// style the circles, set their locations based on data
var circles =
groups.selectAll("circle")
	.data(data)
  .enter().append("circle")
  .attr("class", "circles")
  .attr({
    cx: function(d) { return x(+d.quality_score); },
    cy: function(d) { return y(+d.significance_score); },
    r: 8,
    id: function(d) { return d.publon_id; }
  })
	.style("fill", function(d) { return color(d.journal); });

// what to do when we mouse over a bubble
var mouseOn = function() { 
	var circle = d3.select(this);

// transition to increase size/opacity of bubble
	circle.transition()
	.duration(800).style("opacity", 1)
	.attr("r", 16).ease("elastic");

	// append lines to bubbles that will be used to show the precise data points.
	// translate their location based on margins
	svg.append("g")
		.attr("class", "guide")
	.append("line")
		.attr("x1", circle.attr("cx"))
		.attr("x2", circle.attr("cx"))
		.attr("y1", +circle.attr("cy") + 26)
		.attr("y2", h - margin.t - margin.b)
		.attr("transform", "translate(40,20)")
		.style("stroke", circle.style("fill"))
		.transition().delay(200).duration(400).styleTween("opacity", 
					function() { return d3.interpolate(0, .5); })

	svg.append("g")
		.attr("class", "guide")
	.append("line")
		.attr("x1", +circle.attr("cx") - 16)
		.attr("x2", 0)
		.attr("y1", circle.attr("cy"))
		.attr("y2", circle.attr("cy"))
		.attr("transform", "translate(40,30)")
		.style("stroke", circle.style("fill"))
		.transition().delay(200).duration(400).styleTween("opacity", 
					function() { return d3.interpolate(0, .5); });

// function to move mouseover item to front of SVG stage, in case
// another bubble overlaps it
	d3.selection.prototype.moveToFront = function() { 
	  return this.each(function() { 
		this.parentNode.appendChild(this); 
	  }); 
	};

// skip this functionality for IE9, which doesn't like it
	if (!$.browser.msie) {
		circle.moveToFront();	
		}
};
// what happens when we leave a bubble?
var mouseOff = function() {
	var circle = d3.select(this);

	// go back to original size and opacity
	circle.transition()
	.duration(800).style("opacity", .5)
	.attr("r", 8).ease("elastic");

	// fade out guide lines, then remove them
	d3.selectAll(".guide").transition().duration(100).styleTween("opacity", 
					function() { return d3.interpolate(.5, 0); })
		.remove()
};

// run the mouseon/out functions
circles.on("mouseover", mouseOn);
circles.on("mouseout", mouseOff);

// tooltips (using jQuery plugin tipsy)
circles.append("title")
		.text(function(d) { return "Publon " + d.publon_id; })

$(".circles").tipsy({ gravity: 's', });

// the legend color guide
var legend = svg.selectAll("rect")
		.data(journals)
	.enter().append("rect")
	.attr({
		//y: function(d, i) { return (h - (60-14) - i*50); },
	  y: function(d, i) { return (margin.t + i*30); },
	  x: w + margin.r/2 - 40,
	  width: 30,
	  height: 14,
	})
	.style("fill", function(d) { return color(d); });

// legend labels	
	svg.selectAll("text")
	.data(journals)
	.enter().append("text")
	.attr({
	//y: function(d, i) { return (h - (60-14) - i*50 + 14); },
	y: function(d, i) { return (margin.t + i*30 + 14); },
	x: w + margin.r/3 + 50,
	})
	.attr("width",5)
	.attr("height",5)
	.text(function(d) { return d; });


// Box for legend
/*var box = svg.append("rect")
		.attr({
	  y: h/3 - 10,
	  x: w + margin.r/2 -50,
	  width: 300,
	  height: 240,
	  opacity: 0.1,
	})
	.style("fill", "black");*/


// draw axes and axis labels
svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(" + margin.l + "," + (h - 60 + margin.t) + ")")
	.call(xAxis);

svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + margin.l + "," + margin.t + ")")
	.call(yAxis);

svg.append("text")
	.attr("class", "x label")
	.attr("text-anchor", "end")
	.attr("x", w + 50)
	.attr("y", h - margin.t - 5)
	.text("mean quality score");

svg.append("text")
	.attr("class", "y label")
	.attr("text-anchor", "end")
	.attr("x", -20)
	.attr("y", 45)
	.attr("dy", ".75em")
	.attr("transform", "rotate(-90)")
	.text("mean significance score");
});