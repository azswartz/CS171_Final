

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
        let parentWidth = $("#" + vis.parentElement).width()
        let parentHeight = $("#" + vis.parentElement).height()

        vis.margin = {
            top: parentHeight*0.21,
            right: parentWidth*0.1,
            bottom: parentHeight*0,
            left: parentWidth*0.12};
        vis.width = parentWidth - vis.margin.left - vis.margin.right;
        vis.height = parentHeight - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

        vis.arrow = function(x, y, h){
            let l = 6, h_ = 10;
            return `M ${x}, ${y-h}
            L ${x}, ${y}
            L ${x - l}, ${y - h_}
            L ${x}, ${y}
            L ${x + l}, ${y - h_}`
        }

        // ARROWED DESCRIPTION ////////////////////////

        vis.descGroupNom = vis.svg.append('g')
            .attr('class', 'desc-grp')

        vis.descGroupNom.append('text')
            .text('Nomination')
            .attr('x', 0)
            .attr('y', 0)
            .attr('class', 'desc');

        vis.descGroupNom.append('path')
            .attr('class', 'desc-arrow')
            .attr('stroke', '')
            .attr('d', vis.arrow(0, 65, 50))

        vis.descGroupHear = vis.svg.append('g')
            .attr('class', 'desc-grp')

        vis.descGroupHear.append('text')
            .text('Confirmation')
            .attr('x', 0)
            .attr('y', 0)
            .attr('class', 'desc');

        vis.descGroupHear.append('path')
            .attr('class', 'desc-arrow')
            .attr('stroke', '')
            .attr('d', vis.arrow(0, 45, 30))

        vis.descGroupDays = vis.svg.append('g')
            .attr('class', 'desc-grp');

        vis.descGroupDays.append('text')
            .text('Days between the confirmation')
            .attr('x', 0).attr('y', 0)
            .attr('class', 'desc');
        vis.descGroupDays.append('text')
            .text('and the next election')
            .attr('x', 0).attr('y', 16)
            .attr('class', 'desc');

        vis.descGroupDays.append('path')
            .attr('class', 'desc-arrow')
            .attr('stroke', '')
            .attr('d', vis.arrow(0, 60, 30));

        vis.descGroupDays
            .attr('transform', `translate (${vis.width + 5}, ${-vis.descGroupDays.node().getBBox().height - 24})`)

        vis.svg.append('text')
            // .style('dominant-baseline', 'hanging')
            .attr('text-anchor', 'end')
            .attr('x', 0)
            .attr('y', -65)
            .attr('transform', 'rotate(-90)')
            .style('font-size', 19)
            .text('Senate control');

        // LEGEND ////////////////////////////////
        vis.legend = vis.svg.append('g')
            .attr('class', 'legend');

        vis.rh = 17;
        vis.rw = 70;

        vis.legend.append('rect')
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', vis.rw)
            .attr('height', vis.rh)
            .style('fill', 'royalblue');

        vis.legend.append('rect')
            .attr('x', vis.rw)
            .attr('y', 0)
            .attr('width', vis.rw)
            .attr('height', vis.rh)
            .style('fill', 'royalblue')
            .style('opacity', 0.4);

        vis.legend.append('rect')
            .attr('x', 0)
            .attr('y', vis.rh)
            .attr('width', vis.rw)
            .attr('height', vis.rh)
            .style('fill', 'firebrick');

        vis.legend.append('rect')
            .attr('x', vis.rw)
            .attr('y', vis.rh)
            .attr('width', vis.rw)
            .attr('height', vis.rh)
            .style('fill', 'firebrick')
            .style('opacity', 0.4);

        vis.legend.append('text')
            .attr('x', -3)
            .attr('y', vis.rh/2)
            .attr('class', 'legend-text')
            .text('Dem.');

        vis.legend.append('text')
            .attr('x', -3)
            .attr('y', vis.rh + vis.rh/2)
            .attr('class', 'legend-text')
            .text('Rep.');

        vis.legend.append('text')
            .attr('x', -40)
            .attr('y', vis.rh)
            .attr('class', 'legend-text')
            .text('POTUS');

        vis.legend.append('text')
            .attr('x', vis.rw/2)
            .attr('y', -3)
            .attr('class', 'legend-text-sm')
            .text('confirmed');

        vis.legend.append('text')
            .attr('x', vis.rw + 3)
            .attr('y', -3)
            .attr('class', 'legend-text-sm')
            .style('text-anchor', 'start')
            .text('unconfirmed');

        vis.legend.append('text')
            .attr('x', vis.rw)
            .attr('y', -20)
            .attr('class', 'legend-text-sm')
            .text('Senate hearing');

        vis.legend.append('line')
            .attr('x1', 0)
            .attr('y1', -15)
            .attr('x2', 2*vis.rw)
            .attr('y2', -15);

        vis.legend.append('line')
            .attr('x1', -35)
            .attr('y1', 0)
            .attr('x2', -35)
            .attr('y2', 2*vis.rh);

        // PREPARE DATA ///////////////////////////////////////////////////////
        vis.displayData = vis.data.slice(0, 15)

        let election_date_parse = d3.timeParse("%e %B %Y");

        function nextElection(y) {
            return y % 4 == 0 ? y : Math.floor(y/4)*4 + 4
        }

        vis.election_dates = election_dates.map(d => election_date_parse(d));
        vis.election_years = vis.election_dates.map(d => d.getFullYear());

        vis.displayData.forEach(function(d) {
            if (d.hearing_date){
                d.datediff = d3.timeDay.count(d.nomination_date, d.hearing_date)
            } else {
                d.datediff = 0;
            }

            d.election_year = d.nomination_date.getFullYear()
            d.election = vis.election_years.includes(d.election_year);

            if(d.election){
                d.election_date = vis.election_dates.filter(function(el){
                    return el.getFullYear() == d.election_year
                })[0];
            }else{
                d.election_date = false;
            }

            //    find the number of days till the next election
            d.next_election_year = nextElection(d.election_year);
            d.next_election_date = vis.election_dates.filter(function(el){
                return el.getFullYear() == d.next_election_year
            })[0];
            d.hearing_to_election = d.hearing_date ? d3.timeDay.count(d.hearing_date, d.next_election_date) : false
            d.nomination_to_election = d3.timeDay.count(d.nomination_date, d.next_election_date)
        })

        vis.timeline_h = vis.height/vis.displayData.length
        vis.max_diff = d3.max(vis.displayData.map(d => d.datediff));

        let pad_lo = 12;
        let pad_hi = 150;

        vis.displayData.forEach(function(d){
            d.dateStart = d3.timeDay.offset(d.nomination_date, -pad_lo);

            if(d.hearing_date){
                d.dateEnd = d3.timeDay.offset(d.hearing_date, vis.max_diff - d.datediff + pad_hi);
            } else {
                d.dateEnd = d3.timeDay.offset(d.nomination_date, vis.max_diff + pad_hi);
                d.datediff = d3.timeDay.count(d.nomination_date, d.dateEnd);
            }

        })

        vis.displayData.forEach(function(d) {
            d.x = d3.scaleTime()
                .range([0, vis.width])
                .domain([d.dateStart, d.dateEnd]);
        });


        console.log(vis.displayData)

        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'my-tooltip')

        vis.timeline_groups = vis.svg.selectAll(".timeline")
            .data(vis.displayData, d => d.nominee_ln)
            .enter()
            .append("g")
            .attr("class", (d, i) => i==0 ? "timeline top-timeline": "timeline")
            .attr("transform", (d, i) => `translate(0, ${(i-1/2) * vis.timeline_h})`);


        vis.timeline_groups.append("text")
            .text(d => vis.yearFormatter(d.nomination_date))
            .attr("class", "timeline-year")
            .attr("x", -35)
            .attr("y", vis.timeline_h/2 - 6)
            .style("dominant-baseline", "bottom")
            .attr("text-anchor", "start");

        let rect_height = vis.timeline_h/6

        vis.timeline_groups.append('g')
            .attr('class', d => 'axis timeline-axis axis-'+d3.timeFormat('%j-%Y')(d.nomination_date))
            .attr('transform', `translate(0, ${vis.timeline_h/2})`)
            .each(d => {
                let sel = d3.select('.axis-'+d3.timeFormat('%j-%Y')(d.nomination_date));
                sel.call(d3.axisBottom().scale(d.x).ticks(5).tickFormat(d3.timeFormat('%b')))
            });

        vis.timeline_groups.append("rect")
            .attr("x", d => d.x(d.nomination_date))
            .attr("y", vis.timeline_h/2 - rect_height/2)
            .attr("width", d => {
                if(d.hearing_date) {
                    return d.x(d.hearing_date) - d.x(d.nomination_date)
                } else {
                    return d.x(d.dateEnd) - d.x(d.nomination_date)
                }
            })
            .attr("height", rect_height)
            .style("fill", function(d) {
                let name = d.president_fn + " " + d.president_ln;
                if(pres_to_party[name] == 'Democrat'){
                    return 'royalblue'
                } else {
                    return 'firebrick'
                }
            })
            .style("opacity", d => d.result !== 'C'? 0.3: 1 );

        let election_rect_h = vis.timeline_h/3

        vis.timeline_groups.append('rect')
            .attr("x", d => d.x(d.election_date) - election_rect_h/2)
            .attr("y", vis.timeline_h/2 - election_rect_h/2)
            .attr("width", election_rect_h)
            .attr("height", election_rect_h)
            .style("fill", 'gold')
            .style('stroke', 'dimgray')
            .style('stroke-width', 1)
            .style('opacity', 1)

        vis.timeline_groups.append('text')
            .text(d => {
                return d.hearing_to_election? d.hearing_to_election + ' days': 'Nomination ignored by Senate'})
            .attr('x', vis.width + 35)
            .attr('y', vis.timeline_h/2 - 12)
            .attr("text-anchor", 'end')
            .attr('class', 'to_election');

        vis.timeline_groups.append('rect')
            .attr('x', -55)
            .attr('y', 0)
            .attr('width', 12)
            .attr('height', vis.timeline_h-1)
            .style('fill', d => {
                if(d.hearing_date){
                    return senate_control[d.hearing_date.getFullYear()] == 'Republican' ? 'firebrick' : 'royalblue'
                } else {
                    return senate_control[d.nomination_date.getFullYear()] == 'Republican' ? 'firebrick' : 'royalblue'
                }
            });

        vis.timeline_groups.append('text')
            .attr("class", d => "tooltip-1 tooltip-" + d.nominee_ln)
            .attr("x", vis.width/2)
            .attr("y", vis.timeline_h/2 - 3)
            .text(d => d.nominee_fn + " " + d.nominee_ln)
            .style("fill", function(d) {
                let name = d.president_fn + " " + d.president_ln;
                if(pres_to_party[name] == 'Democrat'){
                    return 'royalblue'
                } else {
                    return 'firebrick'
                }
            })
            .style("opacity", d => d.nominee_ln == 'Garland' | d.nominee_ln == 'Barrett' ? 1:0);

        vis.timeline_groups.append('text')
            .attr("class", d => "tooltip-2 tooltip-" + d.nominee_ln)
            .attr("x", vis.width/2)
            .attr("y", vis.timeline_h/2 + 3)
            .text(d => "to replace " + d["replace"])
            .style("fill", function(d) {
                let name = d.president_fn + " " + d.president_ln;
                if(pres_to_party[name] == 'Democrat'){
                    return 'royalblue'
                } else {
                    return 'firebrick'
                }
            })
            .style("opacity", d => d.nominee_ln == 'Garland' | d.nominee_ln == 'Barrett' ? 1:0);

        vis.timeline_groups.append('rect')
            .attr('x', -55)
            .attr('width', vis.width + 100)
            .attr('height', vis.timeline_h)
            .style('fill', 'black')
            .style('opacity', 0)
            .on("mouseover", function (ev, d) {
                let show = ".tooltip-" + d.nominee_ln;
                vis.svg.selectAll(show).style("opacity", 1);
            })
            .on("mouseout", function (ev, d) {
                if(d.nominee_ln !== 'Garland' && d.nominee_ln !== 'Barrett'){
                    let show = ".tooltip-" + d.nominee_ln;
                    vis.svg.selectAll(show).style("opacity", 0);
                } else {
                    let show = ".tooltip-" + d.nominee_ln;
                    vis.svg.selectAll(show).style("opacity", 1);
                }
            });



        vis.legend.append('rect')
            .attr("x", 2*vis.rw + 10)
            .attr("y", 0)
            .attr("width", election_rect_h)
            .attr("height", election_rect_h)
            .style("fill", 'gold')
            .style('stroke', 'dimgray')
            .style('stroke-width', 1);

        vis.legend.append('text')
            .attr('x', 2*vis.rw + 14 + election_rect_h)
            .attr('y', election_rect_h/2)
            .style('font-size', 12)
            .style('dominant-baseline', 'middle')
            .text('Presidential elections');




        let topTimeline = vis.displayData[0];
        vis.descGroupNom.attr('transform', `translate(${topTimeline.x(topTimeline.nomination_date)}, 
        ${-vis.descGroupNom.node().getBBox().height - 5})`);

        vis.descGroupHear.attr('transform', `translate(${topTimeline.x(topTimeline.hearing_date)}, 
        ${-vis.descGroupHear.node().getBBox().height - 5})`);

        vis.legend.attr('transform', `translate(${topTimeline.x(topTimeline.nomination_date)}, ${-vis.descGroupNom.node().getBBox().height - 2*vis.rh - 20})`);


        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        vis.orderBy = document.getElementById('orderby').value;
        vis.displayData = vis.displayData.sort((a, b) => {
            if(vis.orderBy == 'nomination_date'){
                return b[vis.orderBy] - a[vis.orderBy]
            } else {
                return a[vis.orderBy] - b[vis.orderBy]
            }
        })

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.timelines = vis.svg.selectAll(".timeline")
            .data(vis.displayData, d => d.nominee_ln);

        vis.timeline_groups = vis.timelines
            .enter()
            .append("g")
            .merge(vis.timelines)
            .transition()
            .duration(600)
            .attr("class", (d, i) => i==0 ? "timeline top-timeline": "timeline")
            .attr("transform", (d, i) => `translate(0, ${(i-1/2) * vis.timeline_h})`);

        vis.timelines.exit().remove()

        let topTimeline = vis.displayData[0];

        vis.descGroupNom.attr('transform', `translate(${topTimeline.x(topTimeline.nomination_date)}, 
        ${-vis.descGroupNom.node().getBBox().height - 5})`);

        vis.descGroupHear.transition().duration(600).attr('transform', `translate(${topTimeline.x(topTimeline.hearing_date)}, 
        ${-vis.descGroupHear.node().getBBox().height - 5})`);

        vis.legend.attr('transform', `translate(${topTimeline.x(topTimeline.nomination_date)}, ${-vis.descGroupNom.node().getBBox().height - 2*vis.rh - 20})`);

    }
}