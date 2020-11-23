let courtStacking;

let data_load = [
    d3.csv("../data/confirmations_party_breakdown.csv", function(row) {
        let timeParser = d3.timeParse("(%Y")
        row.confirmed = +row['Confirmed by Senate'];
        row.congress = +row["Congress"];
        row.fraction = +row["Fraction Confirmed"];
        row.referred = +row["Referred to Senate"];
        row.year = timeParser(row.Year.split('-')[0]);
        row.senate = row["Senate Control"];
        row.president = row.President;

        delete row['Confirmed by Senate'];
        delete row["Fraction Confirmed"];
        delete row["Referred to Senate"];
        delete row["Congress"];
        delete row["Year"];
        delete row["Senate Control"];
        delete row.President;

        return row
    }),
    d3.csv("../data/justice_confirmations.csv", function(row) {
        let timeParser_nominations = d3.timeParse("%B %e, %Y");
        let timeParser_hearings_1 = d3.timeParse("%e-%b-%Y");
        let timeParser_hearings_2 = d3.timeParse("%B %e, %Y");

        row.tally_number = +row.tally_number;
        row.voice = row.voice == "0" ? false : true;
        row.vote_no = +row.vote_no;
        row.vote_yes = +row.vote_yes;

        row.hearing_date = timeParser_hearings_1(row.hearing_date) ? timeParser_hearings_1(row.hearing_date) : timeParser_hearings_2(row.hearing_date) ;
        row.nomination_date = timeParser_nominations(row.nomination_date);

        return row
    })
]

Promise.all(data_load).then(function (data) {
    console.log(data);

    courtStacking = new CourtStacking("vis-3", data[0])
});