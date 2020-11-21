class BarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.filteredData = data;
        this.displayData;
        this.displayDataByState;
        this.year = "2020";
        this.type = "spp"
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
            .text("here I am");

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
        $("#distortion").html(Math.round(distortion * 100) / 100);
        //console.log(distortion);

        //update scales
        vis.filteredStates = vis.filteredData.map(d=> d.State);
        //console.log(vis.filteredStates);
        vis.x.domain(vis.filteredStates);

        if(vis.type === "spp"){
            vis.y.domain([0,2 / min]);
            vis.yAxis.tickFormat(d3.format(".1e"));
            vis.svg.select(".x-axis").attr("transform","translate(0," + vis.height + ")");
        } else {
            vis.y.domain([d3.min(vis.displayData.map(d => d.distortion)),2]);
            vis.yAxis.tickFormat(d3.format(".1f"));
            vis.svg.select(".x-axis").attr("transform","translate(0," + vis.y(0) + ")");
        }


        // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        

}