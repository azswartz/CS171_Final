class ScatterPlot {
    constructor(parentElement, popData, leanData) {
        this.parentElement = parentElement;
        this.popData = popData;
        this.leanData = leanData;
        this.type = "pop";
        this.initVis();
    }


    initVis() {
        let vis = this;


        /*vis.margin = {top: 20, right: 20, bottom: 75, left: 60};

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        // Scales and axes
        vis.x = d3.scaleLinear().domain([-40,45]).range([0, vis.width]);
        vis.y = d3.scaleLinear().range([vis.height,0]);
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
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
            .text("Population");

        vis.svg.append("text")
            .attr("class", "x-axis-label")
            .attr("x", vis.height / 2)
            .attr("y",-50)
            .text("% lean toward the right");

        //get state names
        vis.states = [];
        for(let state in vis.popData){
            vis.states.push(state);
        }
        console.log(vis.states);

        //get representation data
        vis.representation = {}*/

        vis.wrangleData();
    }


    wrangleData() {
        let vis = this;
        //select type vis.year = d3.select("#year-select").property("value");



        // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

    }

}