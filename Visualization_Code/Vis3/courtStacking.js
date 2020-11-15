

class CourtStacking {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = _data;
        this.initvis()
    }

    initvis() {
        let vis = this;

        vis.margin = {top: 20, right: 50, bottom: 50, left: 100};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.y = d3.scaleBand()
            .domain(["senate", "president"])
            .range([100, 0])
            .paddingInner(0.2);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y)
            .tickFormat("");

        vis.tiles = vis.svg.append("g")
            .attr("class", "vis2-tiles")
            .attr("transform", `translate(0, ${vis.height - 100})`);

        vis.yAxisGroup = vis.tiles.append("g")
            .attr("class", "axis y-axis")
            .call(vis.yAxis);

        vis.tiles.append("text")
            .attr("x", -10)
            .attr("y", vis.y("president") + vis.y.bandwidth()/2 )
            .style("dominant-baseline", "central")
            .style("text-anchor", "end")
            .text("President")

        vis.tiles.append("text")
            .attr("x", -10)
            .attr("y", vis.y("senate") + vis.y.bandwidth()/2 )
            .style("dominant-baseline", "central")
            .style("text-anchor", "end")
            .text("Senate")

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.sort((a, b) => a.year - b.year)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.pad_w = vis.width * 0.03 / vis.displayData.length
        vis.block_w = vis.width/vis.displayData.length;
        vis.block_h = 40;

        vis.presidentBlocks = vis.tiles.selectAll(".president_blocks")
            .data(vis.displayData, d => d.congress);

        vis.presidentBlocks
            .enter()
            .append("rect")
            .merge(vis.presidentBlocks)
            .attr("class", "president_blocks")
            .attr("x", (d,i)=> i*vis.block_w)
            .attr("y", vis.y("president"))
            .attr("width", vis.block_w - vis.pad_w)
            .attr("height", vis.y.bandwidth)
            .style("fill", (d,i) => d.president == 'Democrat'? 'royalblue' : 'firebrick')

        vis.presidentBlocks.exit().remove();

        vis.senateBlocks = vis.tiles.selectAll(".senate_blocks")
            .data(vis.displayData, d => d.congress);

        vis.senateBlocks
            .enter()
            .append("rect")
            .merge(vis.senateBlocks)
            .attr("class", "senate_blocks")
            .attr("x", (d,i)=> i*vis.block_w)
            .attr("y", vis.y("senate"))
            .attr("width", vis.block_w - vis.pad_w)
            .attr("height", vis.y.bandwidth)
            .style("fill", (d,i) => d.senate == 'Democrat'? 'royalblue' : 'firebrick')

        vis.senateBlocks.exit().remove();

    }
}