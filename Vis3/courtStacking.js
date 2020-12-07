

class CourtStacking {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = _data;
        this.initvis()
    }

    initvis() {
        let vis = this;
        let parentWidth = $("#" + vis.parentElement).width()
        let parentHeight = $("#" + vis.parentElement).height()

        vis.margin = {
            top: parentHeight * 0.0,
            right: parentWidth * 0,
            bottom: parentHeight * 0.02,
            left: parentWidth * 0.13};

        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.pad_w = vis.width * 0.03 / vis.displayData.length;
        vis.block_w = vis.width/vis.displayData.length;
        vis.dot_n = 7;
        vis.max_towers_height_dots = d3.max(
            vis.displayData.map(function (d) {
                return Math.floor(d.referred / vis.dot_n)
            }));
        vis.dot_inter_v = vis.height * 0.75 / vis.max_towers_height_dots;
        vis.dot_inter = vis.block_w/(vis.dot_n + 1);
        vis.dot_r = Math.min(vis.dot_inter, vis.dot_inter_v) * 0.4;
        vis.max_towers_height = vis.max_towers_height_dots * vis.dot_inter_v;
        vis.textbox_h = vis.height*0.07;
        vis.prty_h = vis.height*0.04;
        vis.prty_pad = vis.prty_h*0.1;

        vis.displayData = vis.displayData.sort((a, b) => a.year - b.year)

        vis.tower_groups = vis.svg.selectAll(".dots-tower")
            .data(vis.displayData, d => d.congress)
            .enter()
            .append("g")
            .attr("class", "dots-tower")
            .attr("transform", (d,i) => `translate(${i*vis.block_w}, 30)`);


        vis.tower_groups.append("text")
            .text(d => (d.fraction * 100).toFixed(0) + "%")
            .attr("class", "dot-bar-fraction")
            .attr("x", vis.block_w/2)
            .style("text-anchor", "middle")
            .style("dominant-baseline", "central")
            .style("fill", d => d3.interpolatePlasma(1-d.fraction))
            .attr("y", vis.max_towers_height + vis.textbox_h/2);

        vis.tower_groups.append('rect')
            .attr("class", "president_blocks")
            .attr("x", 2*vis.prty_pad)
            .attr("y",  vis.max_towers_height + vis.textbox_h)
            .attr("width", (vis.block_w - 5*vis.pad_w)/2)
            .attr("height", vis.prty_h - vis.prty_pad)
            .style("fill", (d,i) => d.president == 'Democrat'? 'royalblue' : 'firebrick');

        vis.tower_groups.append('rect')
            .attr("class", "president_blocks")
            .attr("x", vis.block_w/2)
            .attr("y", vis.max_towers_height + vis.textbox_h)
            .attr("width", (vis.block_w - 5*vis.pad_w)/2)
            .attr("height", vis.prty_h - vis.prty_pad)
            .style("fill", (d,i) => d.president == 'Democrat'? 'royalblue' : 'firebrick');

        vis.tower_groups.append('rect')
            .attr("class", "senator_blocks")
            .attr("x", 2*vis.prty_pad)
            .attr("y", vis.prty_h + vis.max_towers_height + vis.textbox_h)
            .attr("width", (vis.block_w - 5*vis.pad_w)/2)
            .attr("height", vis.prty_h - vis.prty_pad)
            .style("fill", (d,i) => d.senate == 'Democrat'? 'royalblue' : 'firebrick');

        vis.tower_groups.append('rect')
            .attr("class", "senator_blocks")
            .attr("x", vis.block_w/2)
            .attr("y", vis.prty_h + vis.max_towers_height + vis.textbox_h)
            .attr("width", (vis.block_w - 5*vis.pad_w)/2)
            .attr("height", vis.prty_h - vis.prty_pad)
            .style("fill", (d,i) => d.senate == 'Democrat'? 'royalblue' : 'firebrick');

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

        vis.svg.append('text')
            .attr('class', 'leg-1')
            .attr('x', -4)
            .attr('y', vis.max_towers_height + 30 + vis.textbox_h + vis.prty_h/2)
            .style('dominant-baseline', 'middle')
            .style("text-anchor", "end")
            .text('POTUS Party')

        vis.svg.append('text')
            .attr('class', 'leg-1')
            .attr('x', -4)
            .attr('y',vis.max_towers_height + 30 + vis.textbox_h + 3*vis.prty_h/2)
            .style('dominant-baseline', 'middle')
            .style("text-anchor", "end")
            .text('Senate Party')

        vis.svg.append('text')
            .attr('class', 'leg-1')
            .attr('x', -4)
            .attr('y',vis.max_towers_height + 30 + vis.textbox_h/2)
            .style('dominant-baseline', 'middle')
            .style("text-anchor", "end")
            .text('Fraction confirmed')

        vis.tower_groups.append("text")
            .attr('class', 'vis-3-year')
            .text(d => d3.timeFormat('%Y')(d.year))
            .attr('x', 2*vis.prty_pad)
            .attr('y', vis.max_towers_height + vis.textbox_h + 2*vis.prty_h)
            .style('dominant-baseline', 'hanging');



        vis.legend = vis.svg.append('g')
            .attr('class', 'legend')
            .attr('transform', `translate(${-vis.margin.left}, ${-vis.margin.top + 10})`)


        let lw = 30, lh = 15;
        vis.legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', lw)
            .attr('height', lh)
            .style('fill', 'royalblue');

        vis.legend.append('text')
            .attr('x', lw + 4)
            .attr('y', lh/2)
            .style('dominant-baseline', 'central')
            .attr('class', 'leg-text')
            .text('Dem. majority');

        vis.legend.append('rect')
            .attr('x', 0)
            .attr('y', lh + 3)
            .attr('width', lw)
            .attr('height', lh)
            .style('fill', 'firebrick');

        vis.legend.append('text')
            .attr('x', lw + 4)
            .attr('y', lh+3 + lh/2)
            .style('dominant-baseline', 'central')
            .attr('class', 'leg-text')
            .text('Rep. majority');

        vis.legend.append('rect')
            .attr('x', 0)
            .attr('y', 2*lh + 6 + lh/4)
            .attr('width', lw)
            .attr('height', lh/2)
            .style('fill', 'gold');

        vis.legend.append('text')
            .attr('x', lw + 4)
            .attr('y', lh * 2 + vis.prty_h/4 + 9)
            .style('dominant-baseline', 'central')
            .attr('class', 'leg-text')
            .text('Presidential election');

        vis.legend.append('circle')
            .attr('cx', lw/2)
            .attr('cy', lh * 2 + vis.prty_h/2 + 18 + vis.dot_r)
            .attr('r', vis.dot_r*3)
            .style('fill', 'lightgrey');
        vis.legend.append('text')
            .attr('x', lw + 4)
            .attr('y', lh * 2 + vis.prty_h/2 + 18 + vis.dot_r)
            .style('dominant-baseline', 'central')
            .attr('class', 'leg-text')
            .text('Unconfirmed referral');
        vis.legend.append('circle')
            .attr('cx', lw/2)
            .attr('cy', lh * 3 + vis.prty_h/2 + 18 + 2*vis.dot_r)
            .attr('r', vis.dot_r*3)
            .style('fill', 'darkseagreen');

        vis.legend.append('text')
            .attr('x', lw + 4)
            .attr('y', lh * 3 + vis.prty_h/2 + 18 + 2*vis.dot_r)
            .style('dominant-baseline', 'central')
            .attr('class', 'leg-text')
            .text('Confirmed referral');

        vis.tower_groups.append('rect')
            .attr('x', vis.block_w*0.8)
            .attr('y', vis.max_towers_height + vis.textbox_h)
            .attr('width', vis.block_w*0.08)
            .attr('height', vis.prty_h- vis.prty_pad)
            .style('fill', 'gold')
            .style('display', d => {
                let year = d.year.getFullYear();
                if((year+1) % 4 == 0){
                    return '1'
                } else {
                    return 'none'
                }
            });

        vis.tower_groups.append('rect')
            .attr('x', vis.block_w*0.8)
            .attr('y', vis.max_towers_height + vis.textbox_h + vis.prty_h)
            .attr('width', vis.block_w*0.08)
            .attr('height', vis.prty_h- vis.prty_pad)
            .style('fill', 'gold')
            .style('display', d => {
                let year = d.year.getFullYear();
                if((year+1) % 4 == 0){
                    return '1'
                } else {
                    return 'none'
                }
            });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.orderby = document.getElementById("orderby").value;

        vis.displayData = vis.displayData.sort((a, b) => a[vis.orderby] - b[vis.orderby])

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.towers = vis.svg.selectAll(".dots-tower")
            .data(vis.displayData, d => d.congress);

        vis.tower_groups = vis.towers
            .enter()
            .append("g")
            .merge(vis.towers)
            .attr("class", "dots-tower")
            .transition()
            .duration(600)
            .attr("transform", (d,i) => {
                console.log(d)
                return `translate(${i * vis.block_w}, 30)`
            });

    }
}