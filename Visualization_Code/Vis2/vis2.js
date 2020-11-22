
let senate_balance, pop_balance;

function sliderUpdate(){
    let count = Number($("#national-slider").val());
    let national_split = count;

    if (count > 0) {
        d3.select("#national-count").text(`${count}%`);
        d3.select("#national-winner").text("Republicans");
        d3.select("#national-loser").text("Democrats");
    }
    if (count <= 0){
        count = - count;
        d3.select("#national-count").text(`${count}%`);
        d3.select("#national-loser").text("Republicans");
        d3.select("#national-winner").text("Democrats");
    }


    senate_balance.wrangleData(national_split);
    pop_balance.wrangleData(national_split);
}

let files = [
    d3.csv("../data/state_partisan_lean.csv"),
    d3.csv("../data/states_pop_2020.csv"),
];

Promise.all(files)
    .then(data => {
        let statepops = {};

        data[1].forEach(d => {
            statepops[state_to_abbrev[d.State]] = Math.round(Number(d.Pop)/1000)*1000;
        })

        let states = data[0].map(d => {
                let lean = d[2020].split("+");

                let sign = 1;
                if (lean[0] === "D"){
                    sign = -1;
                }
                lean = sign * Number(lean[1]);

                return {state: d.state, abbreviation: state_to_abbrev[d.state],
                    lean: lean, pop: statepops[state_to_abbrev[d.state]]};
            }
        );


        states.sort((a,b) => a.lean - b.lean);
        senate_balance = new SenateBalance("senate-vis", states, false);
        pop_balance = new SenateBalance("pop-vis", states, true);

    })

function highlight(state){
    senate_balance.highlight_seat(state);
    pop_balance.highlight_seat(state);
    state = senate_balance.state_info(state);

    let tilt = state.lean + senate_balance.national_split;
    let rep;

    if (tilt > 0){
        rep = "2 Republicans";
    }
    if (tilt < 0){
        rep = "2 Democrats";
    }
    if (tilt === 0){
        rep = "1 Democrat and 1 Republican";
    }

    if (tilt > 0){
        tilt = `R+${tilt}`
    }else{
        tilt = `D+${-tilt}`;
    }

    let party;
    if (state.lean > 0){
        party = "Republican";
    }else{
        party = "Democratic";
    }



    d3.select("#tip").node().innerHTML = `${state.state} is ${Math.abs(state.lean)} more points ${party} than the national average, 
    which means that its outcome is ${tilt} this election. Therefore, we would expect on average that its ${state.pop.toLocaleString()} residents
are represented by ${rep}.`
    d3.select("#tip").node().style.visibility = "visible";

    // let height = d3.select("#tip").node().getBoundingClientRect().height;
    // d3.select("#tip").node().height = height;
    // d3.select("#tip").node().style.height = height;


}

function clear(state){
    senate_balance.clear_seat(state);
    pop_balance.clear_seat(state);
    d3.select("#tip").node().style.visibility = "hidden";
}