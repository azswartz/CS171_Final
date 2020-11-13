
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


d3.csv("../data/state_partisan_lean.csv")
    .then(data => {
        let states = data.map(d => {
                let lean = d[2020].split("+");

                let sign = 1;
                if (lean[0] === "D"){
                    sign = -1;
                }
                lean = sign * Number(lean[1]);

                return {state: d.state, abbreviation: state_to_abbrev[d.state], lean: lean};
            }
        );

        senate_balance = new SenateBalance("", states, 0);
    })