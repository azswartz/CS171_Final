
class SenateBalance{
    constructor(container, state_data, pop_weight){
        this.container = container;
        this.state_data = state_data;
        this.pop_weight = pop_weight;
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

        vis.squaresize = vis.width / 30;
        vis.bluegroup = [0, 0];
        vis.redgroup = [vis.width - vis.squaresize * 15, 0];

        vis.total_pop = 0;
        vis.state_data.forEach(d=> vis.total_pop += d.pop);
        vis.squarepop = vis.total_pop / 100;

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
            let seat1 = d.abbreviation + "1";
            let seat2 = d.abbreviation + "2";
            let color1, color2;
            let group1, group2;
            let pos1, pos2;
            let poprange1, poprange2;

            if (lean > 0) {
                pos1 = vis.redcount;
                pos2 = vis.redcount + 1;
                vis.redcount += 2;
                color1 = "redstate";
                color2 = "redstate";
                group1 = vis.redgroup;
                group2 = vis.redgroup;
                poprange1 = [vis.redpop, vis.redpop + d.pop/2];
                poprange2 = [vis.redpop+d.pop/2, vis.redpop + d.pop];
                vis.redpop += d.pop;
            }
            if (lean < 0) {
                pos1 = vis.bluecount;
                pos2 = vis.bluecount + 1;

                vis.bluecount += 2;
                color1 = "bluestate";
                color2 = "bluestate";
                group1 = vis.bluegroup;
                group2 = vis.bluegroup;
                poprange1 = [vis.bluepop, vis.bluepop + d.pop/2];
                poprange2 = [vis.bluepop+d.pop/2, vis.bluepop + d.pop];
                vis.bluepop += d.pop;
            }
            if (lean === 0) {
                pos1 = vis.bluecount;
                pos2 = vis.redcount;
                vis.redcount += 1;
                vis.bluecount += 1;
                color1 = "bluestate";
                color2 = "redstate";
                group1 = vis.bluegroup;
                group2 = vis.redgroup;
                poprange1 = [vis.bluepop, vis.bluepop + d.pop/2];
                poprange2 = [vis.redpop, vis.redpop + d.pop/2];
                vis.redpop += d.pop / 2;
                vis.bluepop += d.pop / 2;
            }
            return [d, seat1, seat2, pos1, pos2, color1, color2, group1, group2, poprange1, poprange2];
        });

        vis.updateVis();
    };

    updateVis(){
        let vis = this;

        vis.pop_starts = [[0,0],[0,0]];

        vis.mapped_states.forEach(d =>{
            let [state, seat1, seat2, pos1, pos2, color1, color2, group1, group2, poprange1, poprange2] = d;

            if (color1 === "redstate"){
                pos1 = vis.redcount - pos1 - 1;
                poprange1 = [vis.redpop - poprange1[1], vis.redpop - poprange1[0]];
            }
            if (color2 === "redstate"){
                pos2 = vis.redcount - pos2 - 1;
                poprange2 = [vis.redpop - poprange2[1], vis.redpop - poprange2[0]];
            }

            if (!(seat1 in vis.statesquares)) {
                vis.statesquares[seat1] = vis.squaregroup.append("path").attr("id", seat1);
                vis.drawsquares(vis.statesquares[seat1], group1, pos1, color1, false, poprange1);
            }
            if (!(seat2 in vis.statesquares)) {
                vis.statesquares[seat2] = vis.squaregroup.append("path").attr("id", seat2);
                vis.drawsquares(vis.statesquares[seat2], group2, pos2, color2, false, poprange2);
            }

            vis.statesquares[seat1]
                .on('mouseover', event =>highlight(event.target.id))
                .on('mouseout',  event =>clear(event.target.id))

            vis.statesquares[seat2]
                .on('mouseover', event =>highlight(event.target.id))
                .on('mouseout',  event =>clear(event.target.id))

            vis.drawsquares(vis.statesquares[seat1], group1, pos1, color1, true, poprange1);
            vis.drawsquares(vis.statesquares[seat2], group2, pos2, color2, true, poprange2);

            if (vis.bluecount >= vis.redcount) {
                if (vis.pop_weight){
                    d3.select("#majority-rep").text(`${Math.round(vis.bluepop / (vis.bluepop + vis.redpop) * 100)}%`);
                }else{
                    d3.select("#senate-winner").text("Democrats");
                    d3.select("#senate-count").text(`${vis.bluecount - vis.redcount}`);
                    d3.select("#senate-seats").text(`(D${vis.bluecount} - R${vis.redcount})`);
                }
            }
            if (vis.bluecount < vis.redcount) {
                if (vis.pop_weight){
                    d3.select("#majority-rep").text(`${Math.round(vis.redpop / (vis.bluepop + vis.redpop) * 100)}%`);
                }else{
                    d3.select("#senate-winner").text("Republicans");
                    d3.select("#senate-count").text(`${vis.redcount - vis.bluecount}`)
                    d3.select("#senate-seats").text(`(R${vis.redcount} - D${vis.bluecount})`)
                }
            }
        })
    }

    drawsquares(square, group, position, color, transition, poprange){
        let vis = this;

        let start, moves;

        if (vis.pop_weight) {
            poprange = [poprange[0] / vis.squarepop, poprange[1] / vis.squarepop];

            let row = Math.floor(poprange[0] / 10);
            let col = poprange[0] - 10 * row;

            let flip = 1;
            if (row % 2 == 1){
                flip = -1;
                col = 10 - col;
            }

            start = [group[0] + col*vis.squaresize, group[1] + (9-row) *vis.squaresize];

            let endrow = Math.floor(poprange[1] / 10);


            if (row == endrow){
                moves = [
                    [flip *(poprange[1] - poprange[0])*vis.squaresize, 0],
                    [0, vis.squaresize],
                    [-flip *(poprange[1] - poprange[0])*vis.squaresize, 0]
                ];
            }else{
                let fillrow = 10 - (poprange[0] - 10*row);
                let remain = poprange[1] - poprange[0] - fillrow;
                moves = [
                    [0, vis.squaresize],
                    [flip*fillrow * vis.squaresize, 0],
                    [0, -vis.squaresize*2],
                    [-flip*remain*vis.squaresize, 0],
                    [0, vis.squaresize],
                ];
            }

        }else{
            let col = position%10;
            let row = Math.floor((position)/10);
            let flip = 1;

            if (row % 2 == 0){
                flip = -1;
                col = 9 - col;
            }
            console.log(row, col);

            start = [group[0] + (col)*vis.squaresize, group[1] + (9-row)*vis.squaresize];
            moves = [
                [vis.squaresize, 0],
                [0, vis.squaresize],
                [-vis.squaresize, 0]
            ];
        }

        let path = `M${start[0]} ${start[1]} `;
        moves.forEach(d =>{
            path = path + `l${d[0]} ${d[1]} `
        })
        path = path + "Z";

        square.attr("class", color);

        if (transition){
            square.transition().duration(500).attr("d", path);
        }
        else{
            square.attr("d", path);
        }
    }

    highlight_seat(seat){
        this.svg.select(`#${seat}`).attr("style", "fill:gold");
    }

    clear_seat(seat){
        this.svg.select(`#${seat}`).attr("style", "none");
    }
}