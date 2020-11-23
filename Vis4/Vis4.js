let hearingsTimeline;


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
}).then(function(data) {
    console.log(data);
    hearingsTimeline = new HearingsTimeline("vis-4", data);
})
