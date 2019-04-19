let aanwezig = 1;
let betaald = 2;
let onkosten = 3;

let app = new Vue({
  el: '#app',
  data: {
    drinkers: []
  },
  mounted() {
    let url;
    let self = this;

    //Haal waarden van aanwezig datum op
    url = createUrl(aanwezig);
    $.getJSON(url, function(data) {
      let entry = data.feed.entry;
      self.drinkers = getDrinkers(entry);
    })
  }
})

function createUrl(tab) {
  return 'https://spreadsheets.google.com/feeds/cells/1UivtJswE_PLcLG2c4MdsHEou9Uvq1uL0s0eFTokJs6E/' + tab + '/public/values?alt=json';
}


function getDrinkers(entry) {
  let drinkers = [];
  for(let i=0; i < )
  let drinker = new Object();
  drinker[naam] = getNaam
  return drinkers;
}

function countRows(entry) {
  let rows = 0;
  for(let row = 1; row <= entry.length; row++) {
    if (entry.)
  }
}
