class LineGraph {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
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

        //title
        vis.title = vis.svg.append("text")
            .attr("x",vis.width/2)
            .attr("y",10)
            .attr("font-size",24)
            .attr("fill","black")
            .attr("text-anchor","middle");

        //tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip");

        // Scales and axes
        vis.x = d3.scaleLinear().domain([1790,2020]).range([0,vis.width]);
        vis.y = d3.scaleLinear().domain([0,40]).range([vis.height,0]);
        vis.xAxis = d3.axisBottom()
            .scale(vis.x)
            .tickFormat(d3.format("d"));
        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        // Append axes
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        // Axis titles
        vis.svg.append("text")
            .attr("class", "y-axis-label")
            .attr("x", -vis.height / 2)
            .attr("y",-50)
            .attr("transform","rotate(-90)")
            .text("Total Distortion");

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;
        vis.distortion = {};

        //get distortion by year
        vis.years = []
        for(let y = 1790; y <= 2020; y += 10){
            vis.years.push(y);
            vis.filteredData = vis.data.filter(d => {
                return d[y] > 0 && y >= d.yearOfStatehood;
            });
            let n = vis.filteredData.length;
            let distortion = 0;
            let pop = 0;
            for(let i = 0; i < n; i++){
                let d = vis.filteredData[i];
                pop += d[y];
            }
            for(let i = 0; i < n; i++){
                let d = vis.filteredData[i];
                if(2 - 2 * n * d[y] / pop > 0){
                    distortion += 2 - 2 * n * d[y] / pop;
                }
            }
            vis.distortion[y] = distortion;
        }
        //console.log(vis.distortion);

        vis.xAxis.tickValues(vis.years);

        // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.title.text("Total Distortion Over Time")

        vis.svg.append("path")
            .datum(vis.years)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 3)
            .attr("d", d3.line()
                .x(function (d) {
                    return vis.x(d);
                })
                .y(function (d) {
                    return vis.y(vis.distortion[d]);
                })
            )

        vis.svg.selectAll("circle")
            .data(vis.years)
            .enter()
            .append("circle")
            .attr("class", d => "year" + d)
            .attr("fill", "gray")
            .attr("stroke", "gray")
            .attr("cx", d => vis.x(d))
            .attr("cy", d => vis.y(vis.distortion[d]))
            .attr("r", 5)
            .on('mouseover', function(event, d){
                d3.select(".year" + d).attr('fill', 'yellow');

                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 10 + "px")
                    .style("top", event.pageY + 20 + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                            <h2>${d}</h2>
                            <h4>Total distortion: ${Math.round(vis.distortion[d] * 100)/100}</h4>      
                        </div>`
                    );
            })
            .on('mouseout', function(event, d){
                d3.select(".year" + d).attr("fill","gray");

                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });

        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);
    }
}