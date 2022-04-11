
const googleAuth = require('./auth');
const {google} = require('googleapis');

class RecordSheet {

    static updateBeerSheet(ower,owes,date, image, auth)
    {
        let values = [[date,ower,owes,image]];
        let resource = {
            values,
        };
        googleAuth.authorize()
                    .then((auth) => {
                        let sheetsApi = google.sheets({version: 'v4', auth});
                        sheetsApi.spreadsheets.values.append({
                            auth: auth,
                            spreadsheetId: process.env.SPREADSHEET_ID,
                            valueInputOption: "USER_ENTERED",
                            resource: resource,
                            range: "'Beers'!A1:A65000",
                        }, (err, result) => {
                            if (err) {
                              // Handle error.
                              console.log(err);
                            } else {
                              console.log(`${result.updates} cells appended.`);
                            }
                          });
                    })
                    .catch((err) => {
                        console.log('auth error', err);
                    });
    }

    static updateTournamentsSheet(date, tournament,player,division, position, score, auth)
    {
        let values = [[date, tournament, player, division, position, score]];
        let resource = {
            values,
        };
        googleAuth.authorize()
                    .then((auth) => {
                        let sheetsApi = google.sheets({version: 'v4', auth});
                        sheetsApi.spreadsheets.values.append({
                            auth: auth,
                            spreadsheetId: process.env.SPREADSHEET_ID,
                            valueInputOption: "USER_ENTERED",
                            resource: resource,
                            range: "'Tournaments'!A1:A65000",
                        }, (err, result) => {
                            if (err) {
                              // Handle error.
                              console.log(err);
                            } else {
                              console.log(`${result.updates} cells appended.`);
                            }
                          });
                    })
                    .catch((err) => {
                        console.log('auth error', err);
                    });
    }

    static updateChainbreakerEventsSheet(date, event, player, position, score, handicap, auth)
    {
        let values = [[date, event, player, position, score, handicap]];
        let resource = {
            values,
        };
        googleAuth.authorize()
                    .then((auth) => {
                        let sheetsApi = google.sheets({version: 'v4', auth});
                        sheetsApi.spreadsheets.values.append({
                            auth: auth,
                            spreadsheetId: process.env.SPREADSHEET_ID,
                            valueInputOption: "USER_ENTERED",
                            resource: resource,
                            range: "'ChainbreakerEvents'!A1:A65000",
                        }, (err, result) => {
                            if (err) {
                              // Handle error.
                              console.log(err);
                            } else {
                              console.log(`${result.updates} cells appended.`);
                            }
                          });
                    })
                    .catch((err) => {
                        console.log('auth error', err);
                    });
    }

    static updateNotesSheet(date, name, note, image, auth)
    {
        let values = [[date,name,note,image]];
        let resource = {
            values,
        };
        googleAuth.authorize()
                    .then((auth) => {
                        let sheetsApi = google.sheets({version: 'v4', auth});
                        sheetsApi.spreadsheets.values.append({
                            auth: auth,
                            spreadsheetId: process.env.SPREADSHEET_ID,
                            valueInputOption: "USER_ENTERED",
                            resource: resource,
                            range: "'Notes'!A1:A65000",
                        }, (err, result) => {
                            if (err) {
                              // Handle error.
                              console.log(err);
                            } else {
                              console.log(`${result.updates} cells appended.`);
                            }
                          });
                    })
                    .catch((err) => {
                        console.log('auth error', err);
                    });
    }
}

module.exports = RecordSheet;