let aanwezig = 1;
let betaald = 2;
let onkosten = 3;

let app = new Vue({
  el: '#app',
  data: {
    drinkers: [],
    totalen: [],
    terugbetalen: [],
    betaaldInfo: [],
    isLoading: true,
    credEmpty: true
  },
  mounted() {
    let url;
    let self = this;

    url = createUrl(betaald);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.rows = countRows(entry);
      self.cols = countCols(entry);
      self.betaaldInfo = getBetaaldInfo(entry);
    })
    url = createUrl(aanwezig);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.rows = countRows(entry);
      self.cols = countCols(entry);
      self.drinkers = getDrinkers(entry, self.betaaldInfo);
      self.totalen = getTotalen(self.drinkers);
      self.isLoading = false;
    })
    url = createUrl(onkosten);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.rows = countRows(entry);
      self.cols = countCols(entry);
      self.terugbetalen = getTerugbetalen(entry);
      self.credEmpty = isCredEmpty(self.terugbetalen);
    })
  }
})

function createUrl(tab) {
  return 'https://spreadsheets.google.com/feeds/cells/1UivtJswE_PLcLG2c4MdsHEou9Uvq1uL0s0eFTokJs6E/' + tab + '/public/values?alt=json';
}

function getBetaaldInfo(entry) {
  let betaaldInfo = [];
  for (let row = 2; row <= countRows(entry); row++) {
    let betalende = new Object();
    for (let i = 0; i < entry.length; i++) {
      if (entry[i].gs$cell.row == row) {
        switch (entry[i].gs$cell.col) {
          case '1':
            betalende.naam = entry[i].content.$t;
            break;
          case '2':
            betalende.bedrag = Number(entry[i].content.$t.replace('€', '').replace(',', '.'));
            break;
        }
      }
    }
    betaaldInfo.push(betalende);
  }
  return betaaldInfo;
}

function getDrinkers(entry, betaaldInfo) {
  let drinkers = [];
  for (let row = 2; row <= countRows(entry); row++) {
    let drinker = new Object();
    drinker.naam = getNaam(entry, row);
    drinker.aanwezig = getAanwezig(entry, drinker.naam);
    drinker.kosten = getDrinkerKosten(entry, drinker.aanwezig);
    drinker.betaald = getDrinkerBetaald(betaaldInfo, drinker.naam);
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
        if (entry[i].content.$t == 0.5 || entry[i].content.$t == '0,5') {
          half++;
        }
      }
    }
  }
  aanwezig.vol = vol;
  aanwezig.half = half;
  return aanwezig
}

// TODO: Make prices variable
function getDrinkerKosten(entry, aanwezig) {
  let kosten = 0.00;
  let vol = 7.50;
  let half = 5.00;
  kosten += aanwezig.vol * vol;
  kosten += aanwezig.half * half;
  return kosten;
}

function getDrinkerBetaald(betaaldInfo, naam) {
  let betaald = 0;
  for (betalende of betaaldInfo) {
    if (betalende.bedrag != null && betalende.naam == naam) {
      betaald = betalende.bedrag;
      break;
    }
  }
  return betaald;
}

function getTotalen(drinkers) {
  let totalen = [];
  let vol = 0;
  let half = 0;
  let kort = 0;
  let kosten = 0;
  let betaald = 0;
  let totaal = 0;
  for (drinker of drinkers) {
    if (drinker.totaal != 0) {
      vol += drinker.aanwezig.vol;
      half += drinker.aanwezig.half;
      kort += drinker.aanwezig.kort;
      kosten += drinker.kosten;
      betaald += drinker.betaald;
      totaal += drinker.totaal;
    }
  }
  totalen.vol = vol;
  totalen.half = half;
  totalen.kort = kort;
  totalen.kosten = kosten;
  totalen.betaald = betaald;
  totalen.totaal = totaal;
  return totalen;
}

function getTerugbetalen(entry) {
  let terugbetalen = [];
  let row = 0;
  for (let row = 2; row <= countRows(entry); row++) {
    let crediteur = new Object();
    crediteur.info = getCredInfo(entry, row);
    terugbetalen.push(crediteur);
  }
  return terugbetalen;
}

function getCredInfo(entry, row) {
  let info = [];

  for (let i = 0; i < entry.length; i++) {
    if (entry[i].gs$cell.row == row) {
      switch (entry[i].gs$cell.col) {
        case '1':
          info.naam = entry[i].content.$t;
          break;
        case '2':
          info.bedrag = entry[i].content.$t;
          break;
        case '3':
          info.reden = entry[i].content.$t;
          break;
        case '4':
          info.betaald = entry[i].content.$t;
          break;
      }
    }
  }
  return info;
}

function isCredEmpty(terugbetalen) {
  for (crediteur of terugbetalen) {
    if (crediteur.info.betaald == '') {
      return true;
      break;
    }
  }
  return false;
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
