

class CourtStacking {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = _data;
        this.initvis()
    }

    initvis() {
        let vis = this;

        vis.margin = {top: 20, right: 0, bottom: 20, left: 110};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.y = d3.scaleBand()
            .domain(["senate", "president"])
            .range([80, 0])
            .paddingInner(0.1);

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
            .attr("class", "vis-3-y-label")
            .style("dominant-baseline", "central")
            .style("text-anchor", "end")
            .text("President")

        vis.tiles.append("text")
            .attr("x", -10)
            .attr("y", vis.y("senate") + vis.y.bandwidth()/2 )
            .attr("class", "vis-3-y-label")
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

        vis.pad_w = vis.width * 0.03 / vis.displayData.length;
        vis.block_w = vis.width/vis.displayData.length;
        vis.block_h = 40;



        vis.dot_n = 7;
        vis.dot_inter = vis.block_w/(vis.dot_n + 1);
        vis.dot_r = vis.dot_inter * 0.4;
        vis.dot_inter_v = vis.dot_inter * 0.9

        vis.tower_heights_px = vis.displayData.map(function (d) {
            return Math.floor(d.referred / vis.dot_n) * vis.dot_inter_v
        });

        vis.max_towers_height = d3.max(vis.tower_heights_px);


        vis.towers = vis.svg.selectAll("dots-tower")
            .data(vis.displayData);

        vis.tower_groups = vis.towers
            .enter()
            .append("g")
            .merge(vis.towers)
            .attr("class", "dot-tower")
            .attr("transform", (d,i) => `translate(${i*vis.block_w}, 30)`);

        vis.tower_groups.exit().remove();

        vis.tower_groups.append("text")
            .text(d => (d.fraction * 100).toFixed(0) + "%")
            .attr("class", "dot-bar-fraction")
            .attr("x", vis.block_w/2 + 2)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "hanging")
            .style("fill", d => d3.interpolatePlasma(1-d.fraction))
            .attr("y", d => vis.max_towers_height + 12);

        vis.presidentBlocks = vis.tiles.selectAll(".president_blocks")
            .data(vis.displayData, d => d.congress);

        vis.presidentBlocks
            .enter()
            .append("rect")
            .merge(vis.presidentBlocks)
            .attr("class", "president_blocks")
            .attr("x", (d,i)=> i*vis.block_w)
            .attr("y", vis.y("president"))
            .attr("width", 0.5 * (vis.block_w - vis.pad_w))
            .attr("height", vis.y.bandwidth)
            .style("fill", (d,i) => d.president == 'Democrat'? 'royalblue' : 'firebrick')

        vis.presidentBlocks
            .enter()
            .append("rect")
            .merge(vis.presidentBlocks)
            .attr("class", "president_blocks")
            .attr("x", (d,i)=> (i + 0.5)*vis.block_w)
            .attr("y", vis.y("president"))
            .attr("width", 0.5 * (vis.block_w - vis.pad_w))
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
            .attr("width", 0.5*(vis.block_w - vis.pad_w))
            .attr("height", vis.y.bandwidth)
            .style("fill", (d,i) => d.senate == 'Democrat'? 'royalblue' : 'firebrick');

        vis.senateBlocks
            .enter()
            .append("rect")
            .merge(vis.senateBlocks)
            .attr("class", "senate_blocks")
            .attr("x", (d,i)=> (i + 0.5)*vis.block_w)
            .attr("y", vis.y("senate"))
            .attr("width", 0.5*(vis.block_w - vis.pad_w))
            .attr("height", vis.y.bandwidth)
            .style("fill", (d,i) => d.senate == 'Democrat'? 'royalblue' : 'firebrick');

        vis.senateBlocks
            .enter()
            .append("text")
            .attr("class", "vis-3-year")
            .text(d => d3.timeFormat("%Y")(d.year))
            .attr("x", (d,i)=> i*vis.block_w)
            .attr("y", vis.y("senate") + vis.y.bandwidth() + 3)
            .style("dominant-baseline", "hanging");

        vis.senateBlocks.exit().remove();

        vis.tower_groups.selectAll(".tower-dot-ref")
            .data(d => d3.range(d.referred))
            .enter()
            .append("circle")
            .attr("cx", (d,i) => (i % vis.dot_n + 1) * vis.dot_inter)
            .attr("cy", (d,i) => vis.max_towers_height - (Math.floor(i/vis.dot_n) * vis.dot_inter_v))
            .attr("r", vis.dot_r)
            .style("fill", "none")
            .transition()
            .duration(100)
            .delay(d => 200 + d*2)
            .attr("class", "tower-dot-ref")
            .attr("cx", (d,i) => (i % vis.dot_n + 1) * vis.dot_inter)
            .attr("cy", (d,i) => vis.max_towers_height - (Math.floor(i/vis.dot_n) * vis.dot_inter_v))
            .attr("r", vis.dot_r)
            .style("fill", "lightgrey");

        vis.tower_groups.selectAll(".tower-dot-conf")
            .data(d => d3.range(d.confirmed))
            .enter()
            .append("circle")
            .attr("cx", (d,i) => (i % vis.dot_n + 1) * vis.dot_inter)
            .attr("cy", (d,i) => vis.max_towers_height - (Math.floor(i/vis.dot_n) * vis.dot_inter_v))
            .attr("r", vis.dot_r)
            .style("fill", "none")
            .transition()
            .duration(100)
            .delay(d => 200 + d*2)
            .attr("class", "tower-dot-conf")
            .attr("cx", (d,i) => (i % vis.dot_n + 1) * vis.dot_inter)
            .attr("cy", (d,i) => vis.max_towers_height - (Math.floor(i/vis.dot_n) * vis.dot_inter_v))
            .attr("r", vis.dot_r)
            .style("fill", "darkseagreen");



    }
}