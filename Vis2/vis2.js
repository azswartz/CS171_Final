
let senate_balance, pop_balance;

function sliderUpdate(){
    //called on moving the slider

    let count = Number($("#national-slider").val());
    let national_split = count;

    if (count > 0) {
        //republicans win national popular vote
        d3.select("#national-count").text(`${count}%`);
        d3.select("#national-winner").text("Republicans");
        d3.select("#national-loser").text("Democrats");
    }
    if (count <= 0){
        //democrats win national popular vote
        count = - count;
        d3.select("#national-count").text(`${count}%`);
        d3.select("#national-loser").text("Republicans");
        d3.select("#national-winner").text("Democrats");
    }

    //update the visualizations
    senate_balance.wrangleData(national_split);
    pop_balance.wrangleData(national_split);
}

let files = [
    //data sources
    d3.csv("../data/state_partisan_lean.csv"),
    d3.csv("../data/states_pop_2020.csv"),
];

Promise.all(files)
    .then(data => {
        //load data

        let statepops = {};

        data[1].forEach(d => {
            //load in state populations, rounded to nearest 1000
            statepops[state_to_abbrev[d.State]] = Math.round(Number(d.Pop)/1000)*1000;
        })

        let states = data[0].map(d => {
            //for each state, take the 2020 partisan lean
            let lean = d[2020].split("+");

            let sign = 1;
            if (lean[0] === "D"){
                sign = -1;
            }
            //sign the lean based on direction
            lean = sign * Number(lean[1]);

            return {state: d.state, abbreviation: state_to_abbrev[d.state],
                lean: lean, pop: statepops[state_to_abbrev[d.state]]};
            }
        );

        //sort the states by lean and then make the visualizations
        states.sort((a,b) => a.lean - b.lean);
        senate_balance = new SenateBalance("senate-vis", states, false);
        pop_balance = new SenateBalance("pop-vis", states, true);

    })

function highlight(state){
    //called when a state is hovered on

    senate_balance.highlight_seat(state);
    pop_balance.highlight_seat(state);

    //state and seat number
    let number = state.substring(2,3);
    state = senate_balance.state_info(state);

    //get the tilt of the state in the election and who represents it
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
    }else if (tilt < 0){
        tilt = `D+${-tilt}`;
    }else{
        tilt = 'Tie';
    }

    let party;
    if (state.lean > 0){
        party = "R";
    }else{
        party = "D";
    }

    //format the tooltip
    d3.select("#tip").node().innerHTML =
        `<b>${state.state}</b> seat <b>${number}</b>, population <b>${(state.pop/2).toLocaleString()}</b>. Lean relative to nation: <b>${party}+${Math.abs(state.lean)}</b>. 
Expected outcome in this election: <b>${tilt}</b>.`;
    d3.select("#tip").attr("style", "null;");
}

function clear(state){
    //clears the tooltip
    senate_balance.clear_seat(state);
    pop_balance.clear_seat(state);
    d3.select("#tip")
        .attr("style", "font-weight: bold;")
        .text("Hover over a cell for more details!");
}