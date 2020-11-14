
class SenateBalance{
    constructor(container, state_data){
        this.container = container;
        this.state_data = state_data;
        this.initVis();
    }

    initVis(){
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = $("#" + vis.container).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.container).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.container).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.squaregroup = vis.svg.append("g")
            .attr("id", "squaregroup");

        vis.squaresize = vis.width / 40;
        vis.bluegroup = [0,0];
        vis.redgroup = [vis.width - vis.squaresize * 15,0];

        vis.statesquares = {};
        this.wrangleData(0);
    }

    wrangleData(national_split) {
        let vis = this;

        vis.national_split = national_split;

        vis.redcount = 0;
        vis.bluecount = 0;
        vis.redpop = 0;
        vis.bluepop = 0;

        vis.mapped_states = vis.state_data.map(d => {
            let lean = vis.national_split + d.lean;
            let ind1 = d.abbreviation + "1";
            let ind2 = d.abbreviation + "2";
            let col1, col2;
            let group1, group2;
            let pos1, pos2;

            if (lean > 0) {
                pos1 = vis.redcount;
                pos2 = vis.redcount + 1;
                vis.redcount += 2;
                col1 = "redstate";
                col2 = "redstate";
                group1 = vis.redgroup;
                group2 = vis.redgroup;
                vis.redpop += d.pop;
            }
            if (lean < 0) {
                pos1 = vis.bluecount;
                pos2 = vis.bluecount + 1;

                vis.bluecount += 2;
                col1 = "bluestate";
                col2 = "bluestate";
                group1 = vis.bluegroup;
                group2 = vis.bluegroup;
                vis.bluepop += d.pop;
            }
            if (lean === 0) {
                pos1 = vis.bluecount;
                pos2 = vis.redcount;
                vis.redcount += 1;
                vis.bluecount += 1;
                col1 = "bluestate";
                col2 = "redstate";
                group1 = vis.bluegroup;
                group2 = vis.redgroup;
                vis.redpop += d.pop / 2;
                vis.bluepop += d.pop / 2;
            }
            return [ind1, ind2, pos1, pos2, col1, col2, group1, group2];
        });

        vis.updateVis();
    };

    updateVis(){
        let vis = this;

        vis.mapped_states.forEach(d =>{
            let [ind1, ind2, pos1, pos2, col1, col2, group1, group2] = d;

            if (col1 === "redstate"){
                pos1 = vis.redcount - pos1 - 1;
            }
            if (col2 === "redstate"){
                pos2 = vis.redcount - pos2 - 1;
            }
            if (!(ind1 in vis.statesquares)) {
                vis.statesquares[ind1] = vis.squaregroup.append("rect")
                    .attr("id", ind1)
                    .attr("width", vis.squaresize)
                    .attr("height", vis.squaresize)
                    .attr("class", col1)
                    .attr("x", group1[0] + (pos1%10)*vis.squaresize)
                    .attr("y", group1[1] + Math.floor(10-(pos1+1)/10)*vis.squaresize);
            }
            if (!(ind2 in vis.statesquares)) {
                vis.statesquares[ind2] = vis.squaregroup.append("rect")
                    .attr("id", ind2)
                    .attr("width", vis.squaresize)
                    .attr("height", vis.squaresize)
                    .attr("class", col2)
                    .attr("x", group2[0] + (pos2%10)*vis.squaresize)
                    .attr("y", group2[1] + Math.floor(10-(pos2+1)/10)*vis.squaresize);
            }

            vis.statesquares[ind1]
                .transition()
                .duration(500)
                .attr("class", col1)
                .attr("x", group1[0] + (pos1%10)*vis.squaresize)
                .attr("y", group1[1] + Math.floor(10-(pos1+1)/10)*vis.squaresize);

            vis.statesquares[ind2]
                .transition()
                .duration(500)
                .attr("class", col2)
                .attr("x", group2[0] + (pos2%10)*vis.squaresize)
                .attr("y", group2[1] + Math.floor(10-(pos2+1)/10)*vis.squaresize);

            if (vis.bluecount >= vis.redcount) {
                d3.select("#senate-winner").text("Democrats");
                d3.select("#senate-count").text(`${vis.bluecount - vis.redcount}`);
                d3.select("#senate-seats").text(`(D${vis.bluecount} - R${vis.redcount})`);
                d3.select("#majority-rep").text(`${Math.round(vis.bluepop / (vis.bluepop + vis.redpop) * 100)}%`);
            }
            if (vis.bluecount < vis.redcount) {
                d3.select("#senate-winner").text("Republicans");
                d3.select("#senate-count").text(`${vis.redcount - vis.bluecount}`)
                d3.select("#senate-seats").text(`(R${vis.redcount} - D${vis.bluecount})`)
                d3.select("#majority-rep").text(`${Math.round(vis.redpop / (vis.bluepop + vis.redpop) * 100)}%`);
            }
        })
    }



        //

        //


    // }

}