class ColorKey{
    constructor() {
        this.initVis();
    }


    initVis(){
        let vis = this;

        vis.svg = d3.select("#colorkey").append("svg")
            .attr("width", 320)
            .attr("height", 40)
            .append("g");

        //define gradients
        let defs = vis.svg.append("defs");

        let linearGradientNeg = defs.append("linearGradient")
            .attr("id", "linear-gradient-neg");

        let linearGradientPos = defs.append("linearGradient")
            .attr("id", "linear-gradient-pos");

        linearGradientNeg
            .attr("x1", "100%")
            .attr("y1", "0%")
            .attr("x2", "0%")
            .attr("y2", "0%");

        linearGradientPos
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "0%");

        linearGradientNeg.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white");

        linearGradientPos.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "white");

        linearGradientNeg.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "darkred");

        linearGradientPos.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "#64a164");


        let startX = 17;
        let startY = 16;
        let height = 15;
        let width1 = 220;
        let width2 = 40;


        vis.svg.append("rect")
            .attr("x", startX)
            .attr("y", startY)
            .attr("width", width1+width2)
            .attr("height", height)
            .attr("stroke","gray")
            .attr("stroke-width",2);

        vis.svg.append("rect")
            .attr("x",startX)
            .attr("y",startY)
            .attr("width", width1)
            .attr("height", height)
            .style("fill", "url(#linear-gradient-neg)");

        vis.svg.append("rect")
            .attr("x",startX + width1)
            .attr("y",startY)
            .attr("width", width2)
            .attr("height", height)
            .style("fill", "url(#linear-gradient-pos)");

        vis.svg.append("text")
            .attr("x",0)
            .attr("y",27)
            .attr("font-size",10)
            .text("-11")

        vis.svg.append("text")
            .attr("x",280)
            .attr("y",27)
            .attr("font-size",10)
            .text("+2")

        vis.svg.append("text")
            .attr("x",120)
            .attr("y",12)
            .attr("font-size",14)
            .text("distortion")

    }
}