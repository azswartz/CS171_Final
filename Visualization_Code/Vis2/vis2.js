
let senate_balance;

function sliderUpdate(){
    let count = Number($("#national-slider").val());
    let national_split = count;

    let party = "Republicans";

    if (count <= 0){
        party = "Democrats";
        count = - count;
    }

    d3.select("#national-count").text(`${count}%`);
    d3.select("#national-winner").text(party);

    senate_balance.wrangleData(national_split);
}

let files = [
    d3.csv("../data/state_partisan_lean.csv"),
    d3.csv("../data/states_pop_2020.csv"),
];

Promise.all(files)
    .then(data => {
        let statepops = {};

        data[1].forEach(d => {
            statepops[state_to_abbrev[d.State]] = Number(d.Pop);
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
        senate_balance = new SenateBalance("senate-vis", states, 0);
    })