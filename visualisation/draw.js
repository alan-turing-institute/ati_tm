//set-up; margins for each plot, width and heigh, size (radius) of inner circle
var margin = {top: 5, right: 5, bottom: 5, left: 5},
    width = 100 - margin.right - margin.left,
    height = 100 - margin.top - margin.bottom,
    radius = Math.min(width, height) / 2,
    innerRadius = 0.5 * radius;

//set up pie layout - determine width of each section
var pie = d3.layout.pie()
    .sort(null)
    .value(function(d) { return d.width; });

//set up for displaying topic names on hover
var tip = d3.tip()
  .attr('class', 'd3-tip')
  .offset([0, 0])
  .html(function(d) {
    return "<font size='5'>" + topics[d.data.label] + "</font>";
  });

//define arc -- used to draw inner coloured segments
//based primarily on 'score' which is author's proportion of topic
var arc = d3.svg.arc()
  .innerRadius(innerRadius)
  .outerRadius(function (d) {

    //(i) return radius based on score weighted area that want to colour
    theta = (d.data.topicVal/100)*(2*Math.PI)
    area = 100*d.data.score //100 is arbitarily chosen as max area
    r = Math.sqrt(area/(theta/2))
    return r+innerRadius;

    ////(ii) use score to set arc radius as proportion
    //return (radius - innerRadius) * (d.data.score) + innerRadius;
  });

//define outline arc
var outlineArc = d3.svg.arc()
        .innerRadius(innerRadius)
        .outerRadius(radius);

//function to retrieve json data from url
function get_json(url){
  var json = null;
  $.ajax({
      'async': false,
      'global': false,
      'url': url,
      'dataType': "json",
      'success': function (data) {
          json = data;
      }
  });
  return json;
}

//get author information from json file - full name, university + whether to mark in grey
 var author_info = get_json('author_info.json')
//get order in which to display researchers
var names_ordered = get_json('author_order.json')

//empty charts array that will populate
var charts = {}
//keep track of how many plots each uni has to place plots in correct div
var counts = {"Cambridge":0, "Edinburgh":0, "Oxford":0, "UCL":0, "Warwick":0}

//names of topics in order
var topics = ['Social and Applied DS', 'Mathematics Statistics', 'NLP', 'Applications to science', 'Optimization',
              'ML', 'Bayes, MC methods, Markov models', 'Biology, Genetics', 'Networks (wireless, routing, sensor)', 'Networks (social, temporal, fmri)',
              'Knowledge representation (semantic web)', 'Privacy and Security', 'Approximation methods', 'Other' ]

//see https://coolors.co/browser/latest/1 for ideas
//used https://gka.github.io/palettes
//colour palette for topics
var Colors = ['#45666d','#8cb2b0','#c0dac9','#f9dca2','#ffaf7a','#e77d65','#bf5458',
              '#8d3647','#572031','#000000','#424B54', '#898987','#c2bcb0','#e2d4b7']

//color and name of topics in left panel
for (i=1; i<=topics.length+1; i++){
  id = 'topic-' + String(i)
  document.getElementById(id).style.backgroundColor = Colors[i-1];
  document.getElementById(id).innerHTML = '<h6>' + topics[i-1] + '</h6>'
}

//create TF plots, one for each researcher;
//use 'let' to deal with asynchronicity
for (let i=0; i<names_ordered.length; i++){

  //retrieve basic info
  chartName = "chart" + String(i);
  fellow = names_ordered[i];
  uni = author_info[fellow][1];
  counts[uni] += 1
  position_div = "#" + uni[0] + String(counts[uni])

  //create a new svg element for each chart
  charts[chartName] = d3.select("#" + uni).select(position_div).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  //activate tooltips hover effect
  charts[chartName].call(tip);

  //loop through data and populate chart
  d3.csv('data_other.csv', function(error, data){
    chartName = "chart" + String(i);
    fellow = names_ordered[i];
    data.forEach(function(d) {
      d.id  = d.topicNum;
      //for authors that do not have enough publications for - colour in grey
      if(author_info[fellow][2]==1){
        d.color  =  '#d3d3d3';
      }else{
        //otherwise colour segment based on topic colour
        d.color = Colors[d.id];
      }
      d.width  = +d.topicVal;
      d.label  = d.topicNum;
      d.score = d[fellow]/100;
    });

    //draw inner circles
    charts[chartName].selectAll(".solidArc")
      .data(pie(data))
      .enter().append("path")
      .attr("fill", function(d) { return d.data.color; })
      .attr("class", "solidArc")
      .attr("stroke", "#e8e8e8")
      .attr("d", arc)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

    //draw outline arc
    charts[chartName].selectAll(".outlineArc")
        .data(pie(data))
      .enter().append("path")
        .attr("fill", "none")
        .attr("stroke", "#e8e8e8")
        .attr("class", "outlineArc")
        .attr("d", outlineArc);

    //format name
    fellowName = author_info[fellow][0].split(" ")
    if(fellowName.length === 2){
      var firstName = fellowName[0];
      var lastName = fellowName[fellowName.length-1];
    }else if (fellowName.length === 4) {
      var firstName = fellowName[0];
      var lastName = fellowName[1] + " " + String(fellowName[2]) + " " + String(fellowName[3]);
    }
    else{
      var firstName = String(fellowName[0]) + " " + String(fellowName[1]);
      var lastName = fellowName[fellowName.length-1]
    }

    //draw first name
    charts[chartName].append("svg:text")
      .attr("class", "aster-score")
      .attr("dy", ".01em")
      .style("font-size", "8px")
      .attr("text-anchor", "middle")
      .text(firstName);

    //draw last name
    charts[chartName].append("svg:text")
      .attr("class", "aster-score")
      .attr("dy", "1.3em")
      .style("font-size", "8px")
      .attr("text-anchor", "middle")
      .text(lastName);
  });

};
