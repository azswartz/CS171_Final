//get data from the csv
let leanData = {};
d3.csv("data/state_partisan_lean.csv", (row) => {
    leanData[row.state] = +row.lean;
});
console.log(leanData);

let popData = {};
d3.csv("data/states_pop_2020.csv", (row) => {
    popData[row.State] = +row.Pop;
});
console.log(popData);

let scatterPlot = new BarChart("scatterplot", popData, leanData);