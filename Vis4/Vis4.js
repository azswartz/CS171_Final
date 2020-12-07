let hearingsTimeline;

let pres_to_party = {
    "Donald Trump" : 'Republican',
    "Barack Obama" : 'Democrat',
    "GeorgeW. Bush" : 'Republican',
    "Bill Clinton" : 'Democrat',
    "GeorgeH.W. Bush" : 'Republican',
    "Ronald Reagan" : 'Republican',
    "Jimmy Carter" : 'Democrat',
    'Gerald Ford': "Republican",
    "Richard Nixon": "Republican",
    "Lyndon Johnson" : "Democrat",
    "John Kennedy" : "Democrat",
    "Dwight Eisenhower" : "Republican",
    "Harry Truman": "Democrat",
    "Franklin Roosevelt": "Democrat"
}

let senate_control = {
    '2020':'Republican',
    '2019':'Republican',
    '2018':'Republican',
    '2017':'Republican',
    '2016':'Republican',
    '2015':'Republican',
    '2014':'Democrat',
    '2013':'Democrat',
    '2012':'Democrat',
    '2011':'Democrat',
    '2010':'Democrat',
    '2009':'Democrat',
    '2008':'Democrat',
    '2007':'Democrat',
    '2006':'Republican',
    '2005':'Republican',
    '2004':'Republican',
    '2003':'Republican',
    '2002':'Republican',
    '2001':'Republican',
    '2000':'Republican',
    '1999':'Republican',
    '1998':'Republican',
    '1997':'Republican',
    '1996':'Republican',
    '1995':'Republican',
    '1994':'Democrat',
    '1993':'Democrat',
    '1992':'Democrat',
    '1991':'Democrat',
    '1990':'Democrat',
    '1989':'Democrat',
    '1988':'Democrat',
    '1987':'Democrat',
    '1986':'Republican',
    '1985':'Republican',
    '1984':'Republican',
    '1983':'Republican',
    '1982':'Republican',
    '1981':'Republican',
}
let election_dates = ["3 November 1964","5 November 1968","7 November 1972","2 November 1976","4 November 1980","6 November 1984","8 November 1988","3 November 1992","5 November 1996","7 November 2000","2 November 2004","4 November 2008","6 November 2012","8 November 2016", "3 November 2020"]

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


