let aanwezig = 1;
let betaald = 2;
let onkosten = 3;

let app = new Vue({
  el: '#app',
  data: {
    rows: 0,
    dates: 0,
    drinkers: [],
  },
  mounted() {
    let url;
    let self = this;

    //Haal waarden van aanwezig datum op
    url = createUrl(aanwezig);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.rows = countRows(entry);
      self.dates = countDates(entry);
      self.drinkers = getDrinkers(entry);
    })
  }
})

function createUrl(tab) {
  return 'https://spreadsheets.google.com/feeds/cells/1UivtJswE_PLcLG2c4MdsHEou9Uvq1uL0s0eFTokJs6E/' + tab + '/public/values?alt=json';
}

function getDrinkers(entry) {
  let drinkers = [];
  for (let i = 2; i < countRows(entry); i++) {
    let drinker = new Object();
    drinker.naam = getNaam(entry, i);
    drinkers.push(drinker);
  }
  return drinkers;
}

function getNaam(entry, i) {
  let naam;
  for (let j = 2; j < countRows(entry); j++) {
    if (entry[j].gs$cell.row == i && entry[j].gs$cell.col == 1) {
      naam = entry[j].content.$t;
    }
  }
  return naam;
}

function countRows(entry) {
  let rows = 0;
  for (let row = 1; row < entry.length; row++) {
    if (entry[row].gs$cell.row > rows) {
      rows = parseInt(entry[row].gs$cell.row);
    }
  }
  return rows;
}

function countDates(entry) {
  let dates = 0;
  for (let date = 1; date < entry.length; date++) {
    if (entry[date].gs$cell.col > dates) {
      dates = parseInt(entry[date].gs$cell.col);
    }
  }
  return dates;
}
