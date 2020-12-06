class BarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = data;
        this.displayData;
        this.displayDataByState;
        this.year = "2020";
        this.type = "spp"
        this.state_to_abbrev = {"Alabama":"AL", "Alaska":"AK", "Arizona":"AZ", "Arkansas":"AR", "California":"CA", "Colorado":"CO", "Connecticut":"CT", "Delaware":"DE", "District of Columbia":"DC", "Florida":"FL", "Georgia":"GA", "Hawaii":"HI", "Idaho":"ID", "Illinois":"IL", "Indiana":"IN", "Iowa":"IA", "Kansas":"KS", "Kentucky":"KY", "Louisiana":"LA", "Maine":"ME", "Maryland":"MD", "Massachusetts":"MA", "Michigan":"MI", "Minnesota":"MN", "Mississippi":"MS", "Missouri":"MO", "Montana":"MT", "Nebraska":"NE", "Nevada":"NV", "New Hampshire":"NH", "New Jersey":"NJ", "New Mexico":"NM", "New York":"NY", "North Carolina":"NC", "North Dakota":"ND", "Ohio":"OH", "Oklahoma":"OK", "Oregon":"OR", "Pennsylvania":"PA", "Rhode Island":"RI", "South Carolina":"SC", "South Dakota":"SD", "Tennessee":"TN", "Texas":"TX", "Utah":"UT", "Vermont":"VT", "Virginia":"VA", "Washington":"WA", "West Virginia":"WV", "Wisconsin":"WI", "Wyoming":"WY", "American Samoa":"AS", "Guam":"GU", "Northern Mariana Islands":"MP", "Puerto Rico":"PR", "U.S. Virgin Islands":"VI"};
        this.initVis();
    }


    initVis() {
        let vis = this;


        vis.margin = {top: 20, right: 20, bottom: 75, left: 60};

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");
        vis.barGroup = vis.svg.append("g");
        vis.totalRepGroup = vis.svg.append("g");
        vis.totalRepGroup.append("line");
        vis.totalRepGroup.append("text");

        vis.title = vis.svg.append("text")
            .attr("x",vis.width/2)
            .attr("y",10)
            .attr("font-size",24)
            .attr("fill","black")
            .attr("text-anchor","middle");



        // Scales and axes
        vis.x = d3.scaleBand().rangeRound([0, vis.width])
            .paddingInner(0.15);
        vis.y = d3.scaleLinear().range([vis.height,0]);
        vis.colorPos = d3.scaleLinear().domain([0, 2]).range(["white", "#64a164"]);
        vis.colorNeg = d3.scaleLinear().domain([0, -11]).range(["white", "darkred"]);
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickFormat(d3.format(".1e"));

        // Append axes
        vis.xAxisGp = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.yAxisGp = vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Axis titles
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y",-50)
            .attr("transform","rotate(-90)")
            .text("here I am");

        //tooltip group
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip");

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;
        vis.year = d3.select("#year-select").property("value");
        vis.type = d3.select("#ranking-type").property("value");

        //filter data for year
        vis.filteredData = vis.data.filter(d => {
            return d[vis.year] > 0 && vis.year >= d.yearOfStatehood;
        });
        vis.filteredData.sort((a,b) => a[vis.year] - b[vis.year]);


        //get data into the form we want
        let n = vis.filteredData.length;
        let min = vis.filteredData[0][vis.year];
        let pop = 0;
        vis.displayData = new Array(n);
        vis.displayDataByState = {};
        for(let i = 0; i < n; i++){
            let d = vis.filteredData[i];
            pop += d[vis.year];
            vis.displayData[i] = {"state":d.State,"pop":d[vis.year]};
            vis.displayDataByState[d.State] = {"pop": d[vis.year]};
            if(d[vis.year] < min) min = d[vis.year];
        }

        //compute distortion
        let distortion = 0;
        for(let i = 0; i < n; i++){
            let d = vis.filteredData[i];
            vis.displayData[i]["distortion"] = 2 - 2 * n * d[vis.year] / pop;
            vis.displayDataByState[d.State]["distortion"] = 2 - 2 * n * d[vis.year] / pop;
            if(vis.displayData[i]["distortion"] > 0){
                distortion += vis.displayData[i]["distortion"];
            }
        }
        vis.totalRep = 2 * n / pop;
        //console.log(vis.totalRep);
        let minState = vis.filteredData[0];
        let maxState = vis.filteredData[n - 1];
        $("#minstate").html(minState.State);
        $("#maxstate").html(maxState.State);
        $("#maxdiscrepancy").html(Math.round(maxState[vis.year] * 100 / minState[vis.year]) / 100);
        $("#distortion").html(Math.round(distortion * 100) / 100);
        //console.log(distortion);

        //update scales
        vis.filteredStates = vis.filteredData.map(d=> d.State);
        //console.log(vis.filteredStates);
        vis.x.domain(vis.filteredStates);

        if(vis.type === "spp"){
            vis.y.domain([0,2 / min]);
            vis.yAxis.tickFormat(d3.format(".1e"));
        } else {
            vis.y.domain([d3.min(vis.displayData.map(d => d.distortion)),2]);
            vis.yAxis.tickFormat(d3.format(".1f"));
        }


        // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        //update bars
        if(vis.type === "spp"){
            vis.title.text("Representation Across States in " + vis.year);
            vis.totalRepGroup.select("line")
                .attr("stroke","black")
                .transition()
                .attr("opacity", 1)
                .attr('class', "dashed")
                .attr('x1', 0)
                .attr('y1', vis.y(vis.totalRep))
                .attr('x2', vis.width)
                .attr('y2', vis.y(vis.totalRep));
            vis.totalRepGroup.select("text")
                .transition()
                .attr("x", vis.width)
                .attr("y", vis.y(vis.totalRep) - 5)
                .attr("fill", "black")
                .attr("text-anchor", "end")
                .attr("opacity", 1)
                .attr("font-size",12)
                .text("(total senators) / (total population)");
            vis.rectangles = vis.barGroup.selectAll("rect").data(vis.displayData);
            vis.rectangles.enter()
                .append("rect")
                .merge(vis.rectangles)
                .attr("class", d=> vis.state_to_abbrev[d.state])
                .on('mouseover', function(event, d){
                    d3.selectAll("." + vis.state_to_abbrev[d.state])
                        .attr('fill', 'lightblue');
                    let formatComma = d3.format(",");
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 20 + "px")
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h2>${d.state}</h2>
                            <h4> Population: ${formatComma(d["pop"])}</h4>      
                            <h4> Distortion: ${Math.round(d["distortion"] * 100) / 100}</h4> 
                        </div>`
                        );
                })
                .on('mouseout', function(event, d){
                    d3.selectAll("." + vis.state_to_abbrev[d.state])
                        .attr("fill", d => {
                            if(d.distortion > 0)
                                return vis.colorPos(d.distortion);
                            return vis.colorNeg(d.distortion);
                        });

                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                })
                .transition()
                .attr("fill", d => {
                    if(d.distortion > 0)
                        return vis.colorPos(d.distortion);
                    return vis.colorNeg(d.distortion);
                })
                .attr("stroke", "darkgray")
                .attr("stroke-width", 1)
                .attr("x", d => vis.x(d.state))
                .attr("y", d => vis.y(2 / d.pop))
                .attr("height", d => vis.height - vis.y(2 / d.pop))
                .attr("width", vis.x.bandwidth());
            vis.rectangles.exit().remove();
        } else {
            vis.title.text("Distortion Across States in " + vis.year);
            vis.totalRepGroup.select("line")
                .transition()
                .attr("opacity", 0);
            vis.totalRepGroup.select("text")
                .transition()
                .attr("opacity", 0);
            vis.rectangles = vis.barGroup.selectAll("rect").data(vis.displayData);
            vis.rectangles.enter()
                .append("rect")
                .merge(vis.rectangles)
                .attr("class", d=> vis.state_to_abbrev[d.state])
                .on('mouseover', function(event, d){
                    d3.selectAll("." + vis.state_to_abbrev[d.state])
                        .attr('fill', 'lightblue');
                    let formatComma = d3.format(",");
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 10 + "px")
                        .style("top", event.pageY + 20 + "px")
                        .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h2>${d.state}</h2>
                            <h4> Population: ${formatComma(d["pop"])}</h4>      
                            <h4> Distortion: ${Math.round(d["distortion"] * 100) / 100}</h4> 
                        </div>`
                        );
                })
                .on('mouseout', function(event, d){
                    d3.selectAll("." + vis.state_to_abbrev[d.state])
                        .attr("fill", d => {
                            if(d.distortion > 0)
                                return vis.colorPos(d.distortion);
                            return vis.colorNeg(d.distortion);
                        });

                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                })
                .transition()
                .attr("fill", d => {
                    if(d.distortion > 0)
                        return vis.colorPos(d.distortion);
                    return vis.colorNeg(d.distortion);
                })
                .attr("stroke", "darkgray")
                .attr("stroke-width", 1)
                .attr("x", d => vis.x(d.state))
                .attr("y", d => {
                    if(d.distortion > 0) return vis.y(d.distortion);
                    else return vis.y(0);
                })
                .attr("height", d => {
                    if(d.distortion > 0) return vis.y(0) - vis.y(d.distortion);
                    else return vis.y(d.distortion) - vis.y(0);
                })
                .attr("width", vis.x.bandwidth());
            vis.rectangles.exit().remove();

        }

        // Update axes
        if(vis.type === "spp"){
            vis.svg.select(".y-axis-label").text("Senators per Person");
            vis.xAxisGp.transition().attr("transform","translate(0," + vis.height + ")").call(vis.xAxis)
                .selectAll("text")
                .text(d => d)
                .style("text-anchor", "end")
                .attr("dx", "-.8em")
                .attr("dy", ".15em")
                .attr("transform", function(d) {
                    return "rotate(-45)"
                });
        } else {
            vis.svg.select(".y-axis-label").text("Senators Exceeding Allocation by Population");
            vis.xAxisGp.transition().attr("transform","translate(0," + vis.y(0) + ")").call(vis.xAxis)
                .selectAll("text")
                .text(d => d)
                .style("text-anchor", d => {
                    if(vis.filteredStates.includes(d) && vis.displayDataByState[d].distortion > 0)
                        return "end";
                    else return "start";
                })
                .attr("dx", d => {
                    if(vis.filteredStates.includes(d) && vis.displayDataByState[d].distortion > 0)
                        return "-.8em";
                    else {
                        return ".8em";
                    }
                })
                .attr("dy", "-.50em")
                .attr("transform", d => {
                    return "rotate(-75)";
                });
        }

        vis.yAxisGp.transition().call(vis.yAxis);
    }

}