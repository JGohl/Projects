// from data.js
var tableData = data;

// YOUR CODE HERE!
var submit = d3.select("#filter-btn");

var tbody = d3.select("tbody");

submit.on("click", function() {

  d3.event.preventDefault();
  
  var inputElement = d3.select("#datetime")
  var inputValue = inputElement.property("value")

  console.log(inputValue);
  console.log(data);

  var filteredData = tableData.filter(
    sighting => sighting.datetime === inputValue);

  console.log(filteredData)
  d3.select("tbody").selectAll("*").remove();

  filteredData.forEach((sighting) => {
    console.log(sighting);
    tbody.append("tr");
    Object.entries(sighting).forEach(([key, value]) => {
      var cell = tbody.append("td");
      cell.text(value);
    });   
  });
});

