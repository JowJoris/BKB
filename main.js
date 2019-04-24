let aanwezig = 1;
let betaald = 2;
let onkosten = 3;

let app = new Vue({
  el: '#app',
  data: {
    drinkers: [],
    totalen: [],
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
      self.totalen = getTotalen(self.drinkers);
    })
  }
})

function createUrl(tab) {
  return 'https://spreadsheets.google.com/feeds/cells/1UivtJswE_PLcLG2c4MdsHEou9Uvq1uL0s0eFTokJs6E/' + tab + '/public/values?alt=json';
}

function getDrinkers(entry) {
  let drinkers = [];
  for (let row = 2; row <= countRows(entry); row++) {
    let drinker = new Object();
    drinker.naam = getNaam(entry, row);
    drinker.aanwezig = getAanwezig(entry, drinker.naam);
    drinker.kosten = getKosten(entry, drinker.aanwezig);
    drinker.betaald = 0;
    drinker.totaal = drinker.kosten - drinker.betaald;
    drinkers.push(drinker);
  }
  return drinkers;
}

function getNaam(entry, row) {
  let naam;
  for (let i = 0; i < entry.length; i++) {
    if (entry[i].gs$cell.row == row && entry[i].gs$cell.col == 1) {
      naam = entry[i].content.$t;
      break;
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
    if (entry[i].content.$t == naam) {
      row = entry[i].gs$cell.row;
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

// TODO: Make prices variable
function getKosten(entry, aanwezig) {
  let kosten = 0.00;
  let vol = 7.50;
  let half = 5.00;
  let kort = 2.50;
  kosten += aanwezig.vol * vol;
  kosten += aanwezig.half * half;
  kosten += aanwezig.kort * kort;
  return kosten;
}

function getTotalen(drinkers) {
  let totalen = [];
  let vol = 0;
  let half = 0;
  let kort = 0;
  let kosten = 0;
  let betaald = 0;
  let totaal = 0;
  for(drinker of drinkers){
    vol += drinker.aanwezig.vol;
    half += drinker.aanwezig.half;
    kort += drinker.aanwezig.kort;
    kosten += drinker.kosten;
    betaald += drinker.betaald;
    totaal += drinker.totaal;
  }
  totalen.vol = vol;
  totalen.half = half;
  totalen.kort = kort;
  totalen.kosten = kosten;
  totalen.betaald = betaald;
  totalen.totaal = totaal;
  return totalen;
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
