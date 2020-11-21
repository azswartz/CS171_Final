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
            .text("Reallocations Needed to Achieve Equal Representation");

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

        vis.svg.append("path")
            .datum(vis.years)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
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
            .attr("fill", "gray")
            .attr("stroke", "none")
            .attr("cx", d => vis.x(d))
            .attr("cy", d => vis.y(vis.distortion[d]))
            .attr("r", 4);

        vis.svg.select(".y-axis").call(vis.yAxis);
        vis.svg.select(".x-axis").call(vis.xAxis);
    }
}