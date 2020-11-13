
class SenateBalance{
    constructor(container, state_data){
        this.container = container;
        this.state_data = state_data;
        this.initVis();
    }

    initVis(){
        this.wrangleData(0);
    }

    wrangleData(national_split){
        let vis = this;

        vis.national_split = national_split;
        console.log(vis.national_split);

        vis.redcount = 0;
        vis.bluecount = 0;

        vis.state_data.forEach(d =>{
            let lean = vis.national_split + d.lean;
            console.log(d, lean);
            if (lean > 0){
                vis.redcount += 2;
            }
            if (lean < 0){
                vis.bluecount += 2;
            }
            if (lean === 0){
                vis.redcount += 1;
                vis.bluecount += 1;
            }
        });

        console.log(vis.bluecount, vis.redcount);
        if (vis.bluecount >= vis.redcount) {
            d3.select("#senate-winner").text("Democrats");
            d3.select("#senate-count").text(`${vis.bluecount - vis.redcount}`)
            d3.select("#senate-seats").text(`(D${vis.bluecount} - R${vis.redcount})`)
        }
        if (vis.bluecount < vis.redcount) {
            d3.select("#senate-winner").text("Republicans");
            d3.select("#senate-count").text(`${vis.redcount - vis.bluecount}`)
            d3.select("#senate-seats").text(`(R${vis.redcount} - D${vis.bluecount})`)
        }

    }

}