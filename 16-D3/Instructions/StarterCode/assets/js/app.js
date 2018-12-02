// @TODO: YOUR CODE HERE!
var svgWidth = 960;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

function xScale(healthData, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]),
        d3.max(healthData, d => d[chosenXAxis])
      ])
      .range([0, width]);
  
    return xLinearScale; 
}

function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]),
        d3.max(healthData, d => d[chosenYAxis])
      ])
      .range([height, 0]);
  
    return yLinearScale;
}

function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}

function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
  
    yAxis.transition()
      .duration(1000)
      .call(leftAxis);
  
    return yAxis;
}

function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));
  
    return circlesGroup;
}
  
function updateToolTip(chosenXAxis, circlesGroup, chosenYAxis) {

    if (chosenXAxis === "poverty") {
      var xLabel = "In Poverty (%)";
    }
    else if (chosenXAxis === "age") {
      var xLabel = "Age (Median)";
    }
    else {
        var xLabel = "Household Income (Median)"
    }
  
    if (chosenYAxis === "obesity") {
      var yLabel = "Obese (%)";
    }
    else if (chosenYAxis === "smokes") {
      var yLabel = "Smokes (%)";
    }
    else {
      var yLabel = "Lacks Healthcare (%)"
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`<h4>${d.state}</h4><hr>${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
      });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
  }
  
d3.csv("assets/data/data.csv").then(function(healthData, error) {
    if (error) return console.warn(error);

    console.log(healthData);

    // log a list of states
    var states = healthData.map(data => data.state);
    var stateAbbr = healthData.map(data => data.abbr);
    console.log("states", states);

    // Cast each column value in healthData as a number using the parseFloat function
    healthData.forEach(function(data) {
        data.poverty = parseFloat(data.poverty);
        data.age = parseFloat(data.age);
        data.income = +data.income;
        data.healthcare = parseFloat(data.healthcare);
        data.obesity = parseFloat(data.obesity);
        data.smokes = parseFloat(data.smokes);
    //   console.log("State:", data.state);
    //   console.log("State Abbr:", data.abbr);
    //   console.log("Poverty Rate:", data.poverty);
    //   console.log("Average Age:", data.age);
    //   console.log("Average Income:", data.income);
    //   console.log("No Health Insurance Rate:", data.healthcare);
    //   console.log("Obesity Rate:", data.obesity);
    //   console.log("Smoker Rate:", data.smokes);
    });
      // xLinearScale function above csv import
  var xLinearScale = xScale(healthData, chosenXAxis);

  // Create y scale function
  var yLinearScale = yScale(healthData, chosenYAxis);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // append y axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 10)
    .attr("opacity", ".5");

  var circleText = chartGroup.selectAll("stateText")
    .data(healthData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .text(d => d.abbr)
    // .attr("x", 0)
    // .attr("y", 0));
    .attr("x", d => xLinearScale(d[chosenXAxis]))
    .attr("y", d => yLinearScale(d[chosenYAxis]));

  // Create group for  3 x- axis labels
  var xlabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  var povertyLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty (%)");

  var ageLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xlabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for  3 y- axis labels
  var ylabelsGroup = chartGroup.append("g")
    .attr("transform", "rotate(-90)", `translate(${width / 2}, ${height + 20})`);

  var healthcareLabel = ylabelsGroup.append("text")
    .attr("x", -175)
    .attr("y", -30)
    .attr("value", "healthcare")
    .classed("inactive", true)
    .text("Lack Healthcare (%)");
    
  var smokesLabel = ylabelsGroup.append("text")
    .attr("x", -175)
    .attr("y", -50)
    .attr("value", "smokes")
    .classed("inactive", true)
    .text("Smokes (%)");

  var obesityLabel = ylabelsGroup.append("text")
    .attr("x", -175)
    .attr("y", -70)
    .attr("value", "obesity")
    .classed("active", true)
    .text("Obese (%)");

  // updateToolTip function above csv import
  var circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

  // x axis labels event listener
  xlabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var xValue = d3.select(this).attr("value");
      if (xValue !== chosenXAxis) {

        // replaces chosenXAxis with value
        chosenXAxis = xValue;

        // functions here found above csv import
        // updates x scale for new data
        xLinearScale = xScale(healthData, chosenXAxis);

        // updates x axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // updates circles with new x values
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenXAxis, circlesGroup, chosenYAxis);

        // changes classes to change bold text
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
        else if (chosenXAxis === "age") {
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
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
    
    // Y axis label event listener
    ylabelsGroup.selectAll("text")
    .on("click", function() {
      // get value of selection
      var yValue = d3.select(this).attr("value");
      if (yValue !== chosenYAxis) {

        // replaces chosenYAxis with value
        chosenYAxis = yValue;

        // console.log(chosenXAxis)

        // functions here found above csv import
        // updates y scale for new data
        yLinearScale = yScale(healthData, chosenYAxis);

        // updates y axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // updates circles with new y values
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

        // updates tooltips with new info
        circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

        // changes classes to change bold text
        if (chosenYAxis === "obesity") {
          obesityLabel
            .classed("active", true)
            .classed("inactive", false);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);

        }
        else if (chosenYAxis === "smokes") {
            obesityLabel
              .classed("active", false)
              .classed("inactive", true);
            smokesLabel
              .classed("active", true)
              .classed("inactive", false);
            healthcareLabel
              .classed("active", false)
              .classed("inactive", true);
        }
        else {
          obesityLabel
            .classed("active", false)
            .classed("inactive", true);
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
        }
      }
    });
});