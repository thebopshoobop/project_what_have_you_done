'use strict';

const rp = require('request-promise-native');
const _ = require('lodash');

const baseUrl = 'https://congress.api.sunlightfoundation.com/';

const sunlight = {

  getLegislators: function(zipCode) {

    // return the legislators for a given zip code 

    const url = baseUrl + 'legislators/locate?zip=' + zipCode;
    const options = {
      uri: url,
      json: true
    };
    rp(options)
      .then(function(response) {

        let legislators = [];
        response.results.forEach(function(legislator) {
          legislators.push(sunlight.parseLegislator(legislator));
        });

       console.log(legislators);
      })
      .catch(function(error) {
        console.log(error);
      });

  },

  getVotes: function(legislator) {

    // return the votes of a given legislator

    const url = baseUrl + 'votes?order=voted_at&fields=voters,roll_id,question,voted_at&per_page=50';
    const options = {
      uri: url,
      json: true
    }
    rp(options)
      .then(function(response) {
        let votes = [];
        const voteConverter = {
          'Yea': true,
          'Nay': false,
        }

        response.results.forEach(function(vote) {
          if (vote.voters[legislator]) {
            
            let currentVote = {
              'title': vote.question,
              'id': vote.roll_id,
              'time': vote.voted_at,
              'vote': voteConverter[vote.voters[legislator].vote]
            }
            votes.push(currentVote);
          }
        })

        console.log(votes);

      })
      .catch(function(error) {
        console.log(error);
      })

  },

  parseLegislator: function(legislator) {
    const partyConverter = {
      'D': 'Democrat',
      'R': 'Republican',
      'I': 'Independant'
    };
    const titleConverter = {
      'house': 'Representative',
      'senate': 'Senator'
    };
    const nameOptions = [
      'middle_name',
      'last_name',
      'name_suffix'
    ];
    const contactOptions = {
      phone: 'phone',
      email: 'oc_email',
      website: 'website',
      twitter: 'twitter_id',
      youtube: 'youtube_id',
    };

    // basics
    let pol = {
      id: legislator.bioguide_id,
      party: partyConverter[legislator.party],
      chamber: legislator.chamber,
      title: titleConverter[legislator.chamber],
      contact: {}
    };

    // name
    let name = legislator.first_name;;
    if (legislator.nickname) {
      name = legislator.nickname;
    }

    nameOptions.forEach(function(subName) {
      if (legislator[subName]) {
        name += ' ' + legislator[subName];
      }
    });

    pol.name = name;

    // contact
    for (let method in contactOptions) {
      if (legislator[contactOptions[method]]) {
        pol.contact[method] = legislator[contactOptions[method]];
      }
    }

    return pol;

  }

}

module.exports = sunlight;
