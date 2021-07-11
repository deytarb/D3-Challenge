var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 15,
  right: 40,
  bottom: 62,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

//append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chartData = null;

var chosenXAxis = 'poverty'
var chosenYAxis = 'healthcare'

var xAxisLabels = ["poverty", "age", "income"];  
var yAxisLabels = ["obesity", "smokes", "healthcare"];
var labelsTitle = { "poverty": "In Poverty (%)", 
                    "age": "Age (Median)", 
                    "income": "Household Income (Median)",
                    "obesity": "Obese (%)", 
                    "smokes": "Smokes (%)", 
                    "healthcare": "Lacks Healthcare (%)" };

function xScale(healthData,chosenXAxis){
  var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d=>d[chosenXAxis])
      *0.8, d3.max(healthData,d=>d[chosenXAxis])*1.11])
      .range([0,width])
  return xLinearScale;

}

function yScale(healthData, chosenYAxis) {
//scaling
  var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * .9,d3.max(healthData, d => d[chosenYAxis]) * 1.1 ])
      .range([height, 0]);

  return yLinearScale;
}

// bottom
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);

  xAxis.transition()
        .duration(500)
        .call(bottomAxis);

  return xAxis;
}

// updating yAxis var upon click on axis label.
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);

  yAxis.transition()
        .duration(500)
        .call(leftAxis);

  return yAxis;
}

// Function used for updating circles group with a transition to new circles.
function renderCircles(circlesGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {

  circlesGroup.transition()
    .duration(500)
    .attr("cx", d => newXScale(d[chosenXAxis]))
    .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
}

// moving text
function renderText(circletextGroup, newXScale, newYScale, chosenXAxis, chosenYAxis) {
  circletextGroup.transition()
    .duration(700)
    .attr("x", d => newXScale(d[chosenXAxis]))
    .attr("y", d => newYScale(d[chosenYAxis]));
      
  return circletextGroup;
}

// updating circles group with new tooltip.
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

  // X Axis
  if (chosenXAxis === "poverty") {
      var xlabel = "Poverty: ";
  }
  else if (chosenXAxis === "income") {
      var xlabel = "Median Income: "
  }
  else {
      var xlabel = "Age: "
  }

  // Y Axis
  if (chosenYAxis === "healthcare") {
      var ylabel = "Lacks Healthcare: ";
  }
  else if (chosenYAxis === "smokes") {
      var ylabel = "Smokers: "
  }
  else {
      var ylabel = "Obesity: "
  }

  var toolTip = d3.tip()
  .attr("class", "tooltip")
  .style("background", "black")
  .style("color", "white")
  .offset([120, -60])
  .html(function(d) {
      if (chosenXAxis === "age") {
          
          return (`${d.state}<hr>${xlabel} ${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
        } else if (chosenXAxis !== "poverty" && chosenXAxis !== "age") {
         
          return (`${d.state}<hr>${xlabel}$${d[chosenXAxis]}<br>${ylabel}${d[chosenYAxis]}%`);
        } else {
          
          return (`${d.state}<hr>${xlabel}${d[chosenXAxis]}%<br>${ylabel}${d[chosenYAxis]}%`);
        }      
  });

  circlesGroup.call(toolTip);
  
  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data, this);
  })
  
   .on("mouseout", function(data,index) {
    toolTip.hide(data)
  });

return circlesGroup;
}


// Import Data
d3.csv("assets/data/data.csv").then(function(healthData) {

    
    healthData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.healthcare = +data.healthcare;
      data.age = +data.age;
      data.income = +data.income;
      data.smokes = +data.smokes;
      data.obesity = +data.obesity;
    });

    
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

      var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

    var yAxis = chartGroup.append("g")
    .classed("y-axis", true)
    .call(leftAxis);

    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", "15")
    .attr("fill", "green")
    .attr("opacity", "0.4");

    // Add State abbr. text to circles. and some offset to y
    var circletextGroup = chartGroup.selectAll()
    .data(healthData)
    .enter()
    .append("text")
    .text(d => (d.abbr))
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]))
    .style("font-size", "10px")
    .style("text-anchor", "middle")
    .style('fill', 'white');

    var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 6)
        .attr("value", "poverty") 
        .classed("active", true)
        .text("In Poverty (%)");
    
    var healthcareLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.7)
        .attr("y", 0 - (height+12))
        .attr("value", "healthcare") 
        .classed("active", true)
        .text("Lacks Healthcare (%)");

    var ageLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 24)
        .attr("value", "age") 
        .classed("inactive", true)
        .text("Age (Median)");

    var smokeLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.9)
        .attr("y", 0 - (height +30))
        .attr("value", "smokes") 
        .classed("inactive", true)
        .text("Smokes (%)");

    var incomeLabel = labelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 38)
        .attr("value", "income") 
        .classed("inactive", true)
        .text("Household Income (Median)");

    var obesityLabel = labelsGroup.append("text")
        .attr("transform", "rotate(-90)")
        .attr("x", (margin.left) * 2.8)
        .attr("y", 0 - (height +52))
        .attr("value", "obesity") 
        .classed("inactive", true)
        .text("Obesity (%)");

    
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    
    labelsGroup.selectAll("text")
        .on("click", function() {
        //  Value of selection.
          var value = d3.select(this).attr("value");
          console.log(value)

        //if select x axises
          if (true) {
              if (value === "poverty" || value === "age" || value === "income") {
                
                chosenXAxis = value;

               
                xLinearScale = xScale(healthData, chosenXAxis);

                
                xAxis = renderXAxes(xLinearScale, xAxis);

               
                circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

              
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

               
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);

                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age"){
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);

                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);

                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)

                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }}

           else {
                    chosenYAxis = value;
                    
                    yLinearScale = yScale(healthData, chosenYAxis);
                    
                    yAxis = renderYAxes(yLinearScale, yAxis);

                    circlesGroup = renderCircles(circlesGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                    circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

                    circletextGroup = renderText(circletextGroup, xLinearScale, yLinearScale, chosenXAxis, chosenYAxis);

                    // Changes classes to change bold text.
                    if (chosenYAxis === "healthcare") {

                        healthcareLabel
                            .classed("active", true)
                            .classed("inactive", false);


                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                          }
                    else if (chosenYAxis === "smokes"){
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        smokeLabel
                            .classed("active", true)
                            .classed("inactive", false);

                        obesityLabel
                            .classed("active", false)
                            .classed("inactive", true);
                          }
                    else {
                        healthcareLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        smokeLabel
                            .classed("active", false)
                            .classed("inactive", true);

                        obesityLabel
                            .classed("active", true)
                            .classed("inactive", false);
                        }
                   } 
                  }
                
          });
    
    });