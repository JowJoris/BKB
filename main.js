let lijst = 1;
let aanwezig = 2;
let onkosten = 3;
let balans = 4;

let app = new Vue({
  el: '#app',
  data: {
    headersDrinkers: [],
    drinkers: [],
    headersAanwezigen: [],
    aanwezigen: [],
    headersSchuldeisers: [],
    schuldeisers: [],
    headersBalans: [],
    balans: [],
  },
  mounted() {
    let url;
    let self = this;

    //Gezopen lijst
    url = createUrl(lijst);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.headersDrinkers = getHeaders(entry);
      self.drinkers = getDrinkers(entry, self.headersDrinkers);
    })

    //Aanwezig lijst
    url = createUrl(aanwezig);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.headersAanwezigen = getHeaders(entry);
      self.aanwezigen = getAanwezigen(entry, self.headersAanwezigen);
    })

    //Schuldeisers
    url = createUrl(onkosten);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.headersSchuldeisers = getHeaders(entry);
      self.schuldeisers = getEisers(entry, self.headersSchuldeisers);
    })

    //Balans
    url = createUrl(balans);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.headersBalans = getHeaders(entry);
      self.balans = getEisers(entry, self.headersBalans);
    })
  }
})

function createUrl(tab) {
  return 'https://spreadsheets.google.com/feeds/cells/1UivtJswE_PLcLG2c4MdsHEou9Uvq1uL0s0eFTokJs6E/' + tab + '/public/values?alt=json';
}

function getHeaders(entry) {
  let headers = [];

  //Get values of headers
  for (let i = 0; i < entry.length; i++) {
    if (entry[i].gs$cell.row == 1) {
      headers.push(entry[i].content.$t);
    }
  }
  return headers;
}

function getDrinkers(entry, headers) {
  let drinkers = [];

  //Starts at 2 because headers are at number 1
  for (let row = 2; row < entry.length; row++) {

    //Store the values of a 'drinker' in an object
    var drinker = new Object();

    //Number of values are equal to size of headers
    for (let col = 1; col <= headers.length; col++) {

      //For loop to get content of correspondig cell
      for (let i = 0; i < entry.length; i++) {
        if (entry[i].gs$cell.row == row && entry[i].gs$cell.col == col) {
          var header = headers[col - 1];
          drinker[header] = entry[i].content.$t;
        }
      }
    }

    //If 'drinker' has no name value, that means he doesn't exist and gets deleted
    if (drinker.Naam == null) {
      delete drinker;
    } else {
      drinker.Naam = drinker.Naam.replace('.', '');
      drinkers.push(drinker);
    }
  }
  return drinkers;
}