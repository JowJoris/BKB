let aanwezig = 1;
let betaald = 2;
let onkosten = 3;

let app = new Vue({
  el: '#app',
  data: {
    rows: 0,
    cols: 0,
    cell: 0,
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
      self.cols = countCols(entry);
      self.drinkers = getDrinkers(entry);
    })
  }
})

function createUrl(tab) {
  return 'https://spreadsheets.google.com/feeds/cells/1UivtJswE_PLcLG2c4MdsHEou9Uvq1uL0s0eFTokJs6E/' + tab + '/public/values?alt=json';
}

function getDrinkers(entry) {
  let drinkers = [];
  for (let i = 2; i <= countRows(entry); i++) {
    let drinker = new Object();
    drinker.naam = getNaam(entry, i);
    drinker.aanwezig = getAanwezig(entry, 'drinker.naam');
    drinkers.push(drinker);
  }
  return drinkers;
}

function getNaam(entry, i) {
  let naam;
  for (let row = 2; row < entry.length; row++) { // TODO: Fix bug to look at length of countRows
    if (entry[i].gs$cell.row == row && entry[i].gs$cell.col == 1) {
      naam = entry[row].content.$t.replace('.', '');
    }
  }
  return naam;
}

function getAanwezig(entry, naam) {
  let aanwezig = [];
  let vol = 0;
  let half = 0;
  let kort = 0;
  let row = 0;
  for (let i = 0; i < entry.length; i++) {
    if (entry[i].content.t$ == naam) {
      row = parseInt(entry[i].gs$cell.row;
        break;
      }
    }

    for (let i = 0; i < entry.length; i++) {
      for (let col = 2; col <= countCols(entry); col++) {
        if (entry[i].gs$cell.row == row && entry[i].gs$cell.col == col) {
          if (entry[i].content.$t == 1) {
            vol++;
          }
          if (entry[i].content.$t == 0.5) {
            half++;
          }
          if (entry[i].content.$t == 0.25) {
            kort++;
          }
        }
      }
    }
    aanwezig.vol = vol;
    aanwezig.half = half;
    aanwezig.kort = kort;
    return aanwezig
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

  function countCols(entry) {
    let cols = 0;
    for (let col = 1; col < entry.length; col++) {
      if (entry[col].gs$cell.col > cols) {
        cols = parseInt(entry[col].gs$cell.col);
      }
    }
    return cols;
  }
