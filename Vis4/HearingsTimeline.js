

class HearingsTimeline {
    constructor(_parentElement, _data) {
        this.parentElement = _parentElement;
        this.data = _data;
        this.displayData = _data;
        this.initvis()
    }

    initvis() {
        let vis = this;

        vis.yearFormatter = d3.timeFormat("%Y");

        vis.margin = {top: 20, right: 30, bottom: 20, left: 110};
        vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.parentElement).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data.slice(0, 20)

        vis.displayData.forEach(function(d) {
            if (d.hearing_date){
                d.datediff = d3.timeDay.count(d.nomination_date, d.hearing_date)
            } else {
                d.datediff = 0;
            }
        })

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.timeline_h = vis.height/vis.displayData.length
        vis.max_diff = d3.max(vis.displayData.map(d => d.datediff));

        let pad_lo = 10;
        let pad_hi = 10;

        vis.displayData.forEach(function(d){
            d.dateStart = d3.timeDay.offset(d.nomination_date, -pad_lo);

            if(d.hearing_date){
                d.dateEnd = d3.timeDay.offset(d.hearing_date, vis.max_diff - d.datediff + pad_hi);
            } else {
                d.dateEnd = d3.timeDay.offset(d.nomination_date, vis.max_diff + pad_hi);
            }
        })

        vis.displayData.forEach(function(d) {
            d.x = d3.scaleTime()
                .range([0, vis.width])
                .domain([d.dateStart, d.dateEnd]);
        });

        vis.axes = Array(vis.displayData.length);

        vis.displayData.forEach(function(d, i) {
            console.log(i*vis.timeline_h)
            vis.svg.append("g")
                .attr("class", "axis timeline-axis")
                .attr('transform', `translate(0, ${i*vis.timeline_h})`)
                .call(d3.axisBottom()
                    .scale(d.x)
                    .ticks(4))
        });



        console.log(vis.displayData)

        vis.timelines = vis.svg.selectAll(".timeline")
            .data(vis.displayData);



        vis.timeline_groups = vis.timelines
            .enter()
            .append("g")
            .merge(vis.timelines)
            .attr("class", "timeline")
            .attr("transform", (d, i) => `translate(0, ${(i-1/2) * vis.timeline_h})`);

        vis.timeline_groups.exit().remove()

        vis.timeline_groups.append("text")
            .text(d => vis.yearFormatter(d.nomination_date))
            .attr("class", "timeline-year")
            .attr("x", -25)
            .attr("y", vis.timeline_h/2)
            .style("dominant-baseline", "central")
            .attr("text-anchor", "end");

        vis.timeline_groups.append("rect")
            .attr("x", d => d.x(d.nomination_date))
            .attr("y", vis.timeline_h/2 - 5)
            .attr("width", d => {
                if(d.hearing_date) {
                    return d.x(d.hearing_date)
                } else {
                    return d.x(d.dateEnd)
                }
            })
            .attr("height", 10)
            .style("fill", "black")




    }
}