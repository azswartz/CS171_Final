
class SenateBalance{
    //creates a senate balance visualization

    constructor(container, state_data, pop_weight){
        this.container = container;
        this.state_data = state_data;
        this.pop_weight = pop_weight;

        //if pop_weight is True, weight each seat by the population of that seat. Otherwise, each seat is the same size.

        this.initVis();
    }

    initVis(){
        let vis = this;

        //create canvas
        vis.margin = {top: 10, right: 10, bottom: 20, left: 20};
        vis.width = $("#" + vis.container).width() - vis.margin.left - vis.margin.right;
        vis.height = $("#" + vis.container).height() - vis.margin.top - vis.margin.bottom;

        vis.svg = d3.select("#" + vis.container).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);


        //square size, cluster locations on canvas
        vis.squaresize = Math.min(vis.height / 20, vis.width / 40);
        vis.bluegroup = [0, 0];
        vis.redgroup = [vis.width - vis.squaresize * 15, 0];

        //total population and population represented by each square
        vis.total_pop = 0;
        vis.state_data.forEach(d=> vis.total_pop += d.pop);
        vis.squarepop = vis.total_pop / 100;

        vis.statesquares = {}; //references for each square's code

        //length of arm and location of pivot
        vis.armlength = Math.min(vis.height / 2.2, vis.width / 4);
        vis.pivot = [vis.width/2, vis.height/2 + vis.squaresize];


        //draw the parts of the scale
        vis.leftarm = vis.svg.append("rect")
                .attr("x", vis.pivot[0] - vis.armlength)
                .attr("y", vis.pivot[1] -vis.squaresize/4)
                .attr("width", vis.armlength)
                .attr("height", vis.squaresize/2)
                .attr("class", "balance");

        vis.rightarm = vis.svg.append("rect")
            .attr("x", vis.pivot[0])
            .attr("y", vis.pivot[1] -vis.squaresize/4)
            .attr("width", vis.armlength)
            .attr("height", vis.squaresize/2)
            .attr("class", "balance");

        vis.leftbrace = vis.svg.append("rect")
            .attr("x", vis.pivot[0] - vis.armlength - 5*vis.squaresize)
            .attr("y", vis.pivot[1] - vis.squaresize/2)
            .attr("width", vis.squaresize * 10)
            .attr("height", vis.squaresize)
            .attr("class", "balance");

        vis.rightbrace = vis.svg.append("rect")
            .attr("x", vis.pivot[0] + vis.armlength - 5*vis.squaresize)
            .attr("y", vis.pivot[1] - vis.squaresize/2)
            .attr("width", vis.squaresize * 10)
            .attr("height", vis.squaresize)
            .attr("class", "balance");

        vis.leftdot = vis.svg.append("circle")
            .attr("cx", vis.pivot[0] - vis.armlength)
            .attr("cy", vis.pivot[1])
            .attr("r", vis.squaresize)
            .attr("class", "balance");

        vis.rightdot = vis.svg.append("circle")
            .attr("cx", vis.pivot[0] + vis.armlength)
            .attr("cy", vis.pivot[1])
            .attr("r", vis.squaresize)
            .attr("class", "balance");

        vis.pivotdot = vis.svg.append("circle")
            .attr("cx", vis.pivot[0])
            .attr("cy", vis.pivot[1])
            .attr("r", vis.squaresize/2)
            .attr("class", "balance");

        //scales to translate from lean to angle
        vis.scaledegs = d3.scaleLinear()
            .domain([-60,60])
            .range([60,-60]);
        vis.scalerads = d3.scaleLinear()
            .domain([-60,60])
            .range([Math.PI/3,-Math.PI/3]);

        vis.squaregroup = vis.svg.append("g")
            .attr("id", "squaregroup");


        //creates the text legend in the corner
        vis.legend = vis.svg.append("g")
            .attr("class", "legend");

        //adds the text with default values and translates it
        if (vis.pop_weight){
            let label = vis.legend.append("text")
                .text("Each square is one senate seat, where size is");
            let textheight = label.node().getBBox().height;
            vis.legend.append("text")
                .text("proportional to number of constituents")
                .attr("transform",  `translate(0, ${textheight})`);
            vis.legend.append("text")
                .text("(half the population of the state)")
                .attr("transform",  `translate(0, ${2*textheight})`);
            vis.leftlabel = vis.legend.append("text")
                .text("The Democrats represent 144,515,000 people.")
                .attr("transform",  `translate(0, ${4*textheight})`);
            vis.rightlabel = vis.legend.append("text")
                .text("The Republicans represent 186,087,000 people.")
                .attr("transform",  `translate(0, ${5*textheight})`);
            vis.legend.attr("transform", `translate(0, ${vis.height - 5.5 * textheight})`)
        }else{
            let label = vis.legend.append("text")
                .text("Each square is one senate seat");
            let textheight = label.node().getBBox().height;
            vis.leftlabel = vis.legend.append("text")
                .text("The Democrats have 37 seats.")
                .attr("transform",  `translate(0, ${textheight})`);
            vis.rightlabel = vis.legend.append("text")
                .text("The Republicans have 63 seats.")
                .attr("transform",  `translate(0, ${2*textheight})`);
            vis.legend.attr("transform", `translate(0, ${vis.height - 2.5 * textheight})`)
        }


        this.wrangleData(0); //parses the data with default split
    }

    wrangleData(national_split) {
        let vis = this;

        //national split is how the national vote turned out.
        vis.national_split = national_split;

        //number of seats by party and number of constituents by party
        vis.redcount = 0;
        vis.bluecount = 0;
        vis.redpop = 0;
        vis.bluepop = 0;

        vis.mapped_states = vis.state_data.map(d => {
            //for each seat, take the lean in the election and determine which party controls each seat
            let lean = vis.national_split + d.lean;
            let seat1 = d.abbreviation + "1";
            let seat2 = d.abbreviation + "2";
            let color1, color2; //red or blue
            let group1, group2; //red side or blue side of balance
            let pos1, pos2; //location within the side of the balance
            let poprange1, poprange2; //population range of the seat within the list of seat

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
        //draws the visualization

        vis.pop_starts = [[0,0],[0,0]];

        //determines the angle of the balance
        let tilt;
        if (vis.pop_weight){
            tilt = (vis.bluepop - vis.redpop) / (vis.bluepop + vis.redpop) * 100;
        }else{
            tilt = vis.bluecount - vis.redcount;
        }

        //draws the scale at an angle
        vis.rightarm.transition().duration(500).attr("transform", `rotate(${vis.scaledegs(tilt)}, ${vis.pivot[0]}, ${vis.pivot[1]})`);
        vis.leftarm.transition().duration(500).attr("transform", `rotate(${vis.scaledegs(tilt)}, ${vis.pivot[0]}, ${vis.pivot[1]})`);

        vis.lefthold = [vis.pivot[0] - vis.armlength * Math.cos(vis.scalerads(tilt)),
            vis.pivot[1] - vis.armlength * Math.sin(vis.scalerads(tilt))];
        vis.righthold = [vis.pivot[0] + vis.armlength * Math.cos(vis.scalerads(tilt)),
            vis.pivot[1] + vis.armlength * Math.sin(vis.scalerads(tilt))]

        vis.leftbrace
            .transition().duration(500)
            .attr("x", vis.lefthold[0] - 5*vis.squaresize)
            .attr("y", vis.lefthold[1] - vis.squaresize/2)

        vis.rightbrace
            .transition().duration(500)
            .attr("x", vis.righthold[0] - 5*vis.squaresize)
            .attr("y", vis.righthold[1] - vis.squaresize/2)

        vis.leftdot
            .transition().duration(500)
            .attr("cx", vis.lefthold[0])
            .attr("cy", vis.lefthold[1]);
        vis.rightdot
            .transition().duration(500)
            .attr("cx", vis.righthold[0])
            .attr("cy", vis.righthold[1]);

        //determines where to draw the squares based on where the balance is
        vis.bluegroup[0] =vis.lefthold[0] - 5 * vis.squaresize;
        vis.bluegroup[1] = vis.lefthold[1] - 10 * vis.squaresize;
        vis.redgroup[0] = vis.righthold[0] - 5 * vis.squaresize
        vis.redgroup[1] = vis.righthold[1] - 10 * vis.squaresize;

        vis.mapped_states.forEach(d =>{
            let [state, seat1, seat2, pos1, pos2, color1, color2, group1, group2, poprange1, poprange2] = d;
            //draw each seat

            //the red seats are drawn in the backward order so they meet at the middle
            if (color1 === "redstate"){
                pos1 = vis.redcount - pos1 - 1;
                poprange1 = [vis.redpop - poprange1[1], vis.redpop - poprange1[0]];
            }
            if (color2 === "redstate"){
                pos2 = vis.redcount - pos2 - 1;
                poprange2 = [vis.redpop - poprange2[1], vis.redpop - poprange2[0]];
            }

            //if the seat hasn't been drawn before, draw it now and save its code.
            if (!(seat1 in vis.statesquares)) {
                vis.statesquares[seat1] = vis.squaregroup.append("path").attr("id", seat1);
                vis.drawsquares(vis.statesquares[seat1], group1, pos1, color1, false, poprange1);

                vis.statesquares[seat1]
                    .on('mouseover', event =>highlight(event.target.id))
                    .on('mouseout',  event =>clear(event.target.id));
            }
            if (!(seat2 in vis.statesquares)) {
                vis.statesquares[seat2] = vis.squaregroup.append("path").attr("id", seat2);
                vis.drawsquares(vis.statesquares[seat2], group2, pos2, color2, false, poprange2);

                vis.statesquares[seat2]
                    .on('mouseover', event =>highlight(event.target.id))
                    .on('mouseout',  event =>clear(event.target.id))
            }

            //otherwise take the already drawn square and update it
            vis.drawsquares(vis.statesquares[seat1], group1, pos1, color1, true, poprange1);
            vis.drawsquares(vis.statesquares[seat2], group2, pos2, color2, true, poprange2);
        })

        //update the text to show who won
        if (vis.bluecount >= vis.redcount) {
            if (vis.pop_weight){
                //for population weight
                let sep = Math.round(vis.bluepop / (vis.bluepop + vis.redpop) * 100);
                sep = sep - (100-sep);
                d3.select("#majority-rep").text(`${sep}%`);
            }else{
                //for seat weight
                d3.select("#senate-winner").text("Democrats");
                d3.select("#senate-loser").text("Republicans");
                d3.select("#senate-count").text(`${vis.bluecount - vis.redcount}`);
            }
        }
        if (vis.bluecount < vis.redcount) {
            if (vis.pop_weight){
                let sep = Math.round(vis.redpop / (vis.bluepop + vis.redpop) * 100);
                sep = sep - (100-sep);
                d3.select("#majority-rep").text(`${sep}%`);
            }else{
                d3.select("#senate-winner").text("Republicans");
                d3.select("#senate-loser").text("Democrats");
                d3.select("#senate-count").text(`${vis.redcount - vis.bluecount}`)
            }
        }
        if (vis.pop_weight){
            vis.leftlabel.text(`The Democrats represent ${vis.bluepop.toLocaleString()} people.`)
            vis.rightlabel.text(`The Republicans represent ${vis.redpop.toLocaleString()} people.`)
        }else{
            vis.leftlabel.text(`The Democrats have ${vis.bluecount} seats.`)
            vis.rightlabel.text(`The Republicans have ${vis.redcount} seats.`)
        }

        //move the text legend out of the way
        let legend_width = vis.legend.node().getBBox().width;
        let legend_height = vis.legend.node().getBBox().height;
        if (tilt > 0) {
            vis.legend.attr("transform", `translate(${vis.width - legend_width}, ${vis.height - legend_height})`)
        }else{
            vis.legend.attr("transform", `translate(0, ${vis.height - legend_height})`)
        }
    }

    drawsquares(square, group, position, color, transition, poprange){
        let vis = this;
        //takes the square and puts it in the correct shape and place

        let start, moves;

        if (vis.pop_weight) {
            //if the visualization is population weighted

            //population range the state takes
            poprange = [poprange[0] / vis.squarepop, poprange[1] / vis.squarepop];

            //where the seat starts
            let row = Math.floor(poprange[0] / 10);
            let col = poprange[0] - 10 * row;

            //seats are arranged in a boustrophedon order
            let flip = 1;
            if (row % 2 == 1){
                flip = -1;
                col = 10 - col;
            }

            //get the location of the start of the seat
            start = [group[0] + col*vis.squaresize, group[1] + (9-row) *vis.squaresize];

            let endrow = Math.floor(poprange[1] / 10);

            //get the moves necessary to fill out the seat, moving onto the next line if necessary
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
            // if each seat is the same size, this is much easier.
            let col = position%10;
            let row = Math.floor((position)/10);
            let flip = 1;

            //seats are still arranged boustrophedon
            if (row % 2 == 0){
                flip = -1;
                col = 9 - col;
            }

            start = [group[0] + (col)*vis.squaresize, group[1] + (9-row)*vis.squaresize];
            moves = [
                [vis.squaresize, 0],
                [0, vis.squaresize],
                [-vis.squaresize, 0]
            ];
        }

        //draw each seat as a path
        let path = `M${start[0]} ${start[1]} `;
        moves.forEach(d =>{
            path = path + `l${d[0]} ${d[1]} `
        })
        path = path + "Z";

        //give it the color
        square.attr("class", color);

        //draw the path and add a transition if requested
        if (transition){
            square.transition().duration(500).attr("d", path);
        }
        else{
            square.attr("d", path);
        }
     }

    highlight_seat(seat){
        let vis = this;

        //color the seat gold
        vis.svg.select(`#${seat}`).attr("style", "fill:gold");
        let state = vis.state_info(seat);

    }

    clear_seat(seat){
        //return to the original color
        this.svg.select(`#${seat}`).attr("style", "none");
    }

    state_info(state){
        //gets the full information for a state from its seat id
        state = state.substring(0,2);
        let full;
        this.state_data.forEach(d =>{
            if (d.abbreviation === state){
                full = d;
            }
        })
        return full;
    }
}