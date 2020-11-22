//get relevant data from the csv
let states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
let leanData = {};
let popData = {};
let repData = {}
let maxPop = 0;
let maxRep = 0;
d3.csv("data/state_partisan_lean.csv", (row) => {
    row.lean = +row.lean;
    return row;
}).then(data => {
        leanData = data;
        d3.csv("data/states_pop_2020.csv", (row) => {
            row.population = +row.population;
            if (row.population > maxPop) maxPop = row.population;
            if (2 / row.population > maxRep) maxRep = 2 / row.population;
            return row;
        }).then(data => {
            popData = data;
            initVis();
        })
    }
);

var margin, width, height, svg, x, y, xAxis, yAxis, circleLayer, lineLayer, circles, trendline;
var dataByState = {};
function initVis() {
    //get dataByState
    let rightDist = 0;
    let leftDist = 0;
    let popTotal = 0;
    for(let i = 0; i < 50; i++){
        dataByState[popData[i].state] = {"population": popData[i]["population"]};
        popTotal += dataByState[popData[i].state]["population"];
    }
    for(let i = 0; i < 50; i++){
        let state = leanData[i].state;
        dataByState[state]["lean"] = leanData[i].lean;
        if(dataByState[state].lean > 0)
            rightDist += 2 - 100 * dataByState[state]["population"] / popTotal;
        else if(dataByState[state].lean < 0)
            leftDist += 2 - 100 * dataByState[state]["population"] / popTotal;
    }

    //get distortions
    if(rightDist > 0){
        $("#rightdist").html(Math.round(rightDist * 100) / 100 + " more");
    }else{
        $("#rightdist").html(Math.round(-rightDist * 100) / 100 + " fewer");
    }

    if(leftDist > 0){
        $("#leftdist").html(Math.round(leftDist * 100) / 100 + " more");
    }else{
        $("#leftdist").html(Math.round(-leftDist * 100) / 100 + " fewer");
    }

    //draw initial visualization
    margin = {top: 20, right: 20, bottom: 75, left: 100};
    width = $("#scatterplot").width() - margin.left - margin.right;
    height = 500 - margin.top - margin.bottom;

    // SVG drawing area
    svg = d3.select("#scatterplot").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    //set up circles and trendline
    lineLayer = svg.append("g");
    circleLayer = svg.append("g");
    circles = circleLayer.selectAll("circle").data(states)
        .enter()
        .append("circle");
    trendline = lineLayer.append("path").datum([0, width]);

    // Scales and axes
    x = d3.scaleLinear().domain([-40, 45]).range([0, width]);
    y = d3.scaleLinear().range([height, 0]);
    xAxis = d3.axisBottom()
        .scale(x);
    yAxis = d3.axisLeft()
        .scale(y);

    // Append axes
    svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + height + ")");

    svg.append("g")
        .attr("class", "y-axis axis");

    // Axis titles
    svg.append("text")
        .attr("class", "y-axis-label")
        .attr("x", -height / 2)
        .attr("y", -70)
        .attr("transform", "rotate(-90)")
        .text("Population");

    svg.append("text")
        .attr("class", "x-axis-label")
        .attr("x", width / 2)
        .attr("y", height + 40)
        .text("% lean toward right");

    updateVis();

}

function updateVis(){
    let type = d3.select("#type-select").property("value");

    if(type === "spp"){
        //update y-axis
        svg.select(".y-axis-label").text("Senators per person");
        y.domain([0, maxRep * 1.05]);
        yAxis.tickFormat(d3.format(".1e"));

        //update trendline
        trendline.attr("fill", "none")
            .transition()
            .attr("stroke", "green")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) {
                    return d;
                })
                .y(function (d) {
                    return y(0.000000007381817 * x.invert(d) + 0.000000766207662);
                })
            );

        //update points
        circles.attr("r", 5)
            .transition()
            .attr("cx", d => {
                return x(dataByState[d].lean);
            })
            .attr("cy", d => y(2 / dataByState[d].population))
            .attr("fill", "lightgray")
            .attr("stroke","gray");
    } else {
        //update y-axis
        svg.select(".y-axis-label").text("Population");
        y.domain([0, maxPop * 1.05]);
        yAxis.tickFormat(d3.format(",.0f"));

        //update trendline
        trendline.attr("fill", "none")
            .transition()
            .attr("stroke", "red")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function (d) {
                    return d;
                })
                .y(function (d) {
                    return y(-98861.41 * x.invert(d) + 7226887.84);
                })
            );

        //update points
        circles.attr("r", 5)
            .transition()
            .attr("cx", d => {
                return x(dataByState[d].lean);
            })
            .attr("cy", d => {
                return y(dataByState[d].population);
            })
            .attr("fill", "lightgray")
            .attr("stroke","gray");
    }
    svg.select(".x-axis").transition().call(xAxis);
    svg.select(".y-axis").transition().call(yAxis);
}