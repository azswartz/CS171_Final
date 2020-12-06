//get relevant data from the csv
let states = ["Alabama","Alaska","Arizona","Arkansas","California","Colorado","Connecticut","Delaware","Florida","Georgia","Hawaii","Idaho","Illinois","Indiana","Iowa","Kansas","Kentucky","Louisiana","Maine","Maryland","Massachusetts","Michigan","Minnesota","Mississippi","Missouri","Montana","Nebraska","Nevada","New Hampshire","New Jersey","New Mexico","New York","North Carolina","North Dakota","Ohio","Oklahoma","Oregon","Pennsylvania","Rhode Island","South Carolina","South Dakota","Tennessee","Texas","Utah","Vermont","Virginia","Washington","West Virginia","Wisconsin","Wyoming"]
let state_to_abbrev = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "American Samoa":"AS", "Guam":"GU", "Northern Mariana Islands":"MP", "Puerto Rico":"PR", "U.S. Virgin Islands":"VI"};
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

var margin, width, height, svg, x, y, xAxis, yAxis, circleLayer, lineLayer, circles, title, trendline, demscale, repscale, tooltip;
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

    //vis title
    title = svg.append("text")
        .attr("x",width/2)
        .attr("y",10)
        .attr("font-size","3VH")
        .attr("fill","black")
        .attr("text-anchor","middle");

    //set up circles and trendline
    lineLayer = svg.append("g");
    circleLayer = svg.append("g");
    circles = circleLayer.selectAll("circle").data(states)
        .enter()
        .append("circle");
    trendline = lineLayer.append("path").datum([0, width]);

    //tooltip
    tooltip = d3.select("body").append('div')
        .attr('class', "tooltip");

    // Scales and axes
    x = d3.scaleLinear().domain([-40, 45]).range([0, width]);
    y = d3.scaleLinear().range([height, 0]);
    xAxis = d3.axisBottom()
        .scale(x);
    yAxis = d3.axisLeft()
        .scale(y);
    demscale = d3.scaleLinear().domain([0,40]).range(["white","royalblue"]);
    repscale = d3.scaleLinear().domain([0,45]).range(["white","firebrick"]);

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
        .text("Partisan Lean (positive is to the Republican party, negative is to the Democratic party)");

    updateVis();

}

function updateVis(){
    let type = d3.select("#type-select").property("value");

    if(type === "spp"){
        //title
        title.text("Representation vs. Partisan Lean");

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
            .attr("class", d => state_to_abbrev[d])
            .on('mouseover', function(event, d){
                d3.selectAll("." + state_to_abbrev[d])
                    .attr('fill', "gray");
                let formatComma = d3.format(",");
                tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h2>${d}</h2>
                            <h4> Senators per Person: ${(2/(dataByState[d].population)).toExponential(2)}</h4>     
                            <h4> Partisan Lean: ${dataByState[d].lean}%</h4>
                        </div>`
                    );
            })
            .on('mouseout', function(event, d){
                d3.selectAll("." + state_to_abbrev[d])
                    .attr("fill", d=>{
                        let lean = dataByState[d].lean;
                        if(lean >= 0){
                            return repscale(lean);
                        }else{
                            return demscale(-lean);
                        }
                    });

                tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .attr("cx", d => {
                return x(dataByState[d].lean);
            })
            .attr("cy", d => y(2 / dataByState[d].population))
            .attr("fill", d=>{
                let lean = dataByState[d].lean;
                if(lean >= 0){
                    return repscale(lean);
                }else{
                    return demscale(-lean);
                }
            })
            .attr("stroke","gray");
    } else {
        //title
        title.text("Population vs. Partisan Lean");

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
            .on('mouseover', function(event, d){
                d3.selectAll("." + state_to_abbrev[d])
                    .attr('fill', "gray");
                let formatComma = d3.format(",");
                tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 10 + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h2>${d}</h2>
                            <h4> Population: ${formatComma(dataByState[d].population)}</h4>   
                            <h4> Partisan Lean: ${dataByState[d].lean}%</h4>
                        </div>`
                    );
            })
            .on('mouseout', function(event, d){
                d3.selectAll("." + state_to_abbrev[d])
                    .attr('fill', d=>{
                        let lean = dataByState[d].lean;
                        if(lean >= 0){
                            return repscale(lean);
                        }else{
                            return demscale(-lean);
                        }
                    });

                tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .transition()
            .attr("cx", d => {
                return x(dataByState[d].lean);
            })
            .attr("cy", d => {
                return y(dataByState[d].population);
            })
            .attr("fill", d=>{
                let lean = dataByState[d].lean;
                if(lean >= 0){
                    return repscale(lean);
                }else{
                    return demscale(-lean);
                }
            })
            .attr("stroke","gray");
    }
    svg.select(".x-axis").transition().call(xAxis);
    svg.select(".y-axis").transition().call(yAxis);
}