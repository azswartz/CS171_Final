//get data from the csv
let barchart;
d3.csv("data/states_pop.csv", (row) => {
    for(let i = 1790; i < 2021; i += 10){
        let year = "" + i;
        row[year] = +row[year];
    }
    row.yearOfStatehood = +row.yearOfStatehood;
    return row;
}).then(data => {
    //console.log(data);

    //initialize visualization
    barchart = new BarChart("barchart", data);
    linegraph = new LineGraph("linegraph", data);
});

function updateVisualization(){
    barchart.wrangleData();
}