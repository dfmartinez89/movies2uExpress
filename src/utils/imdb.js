const imdbUrl = (apikey, criteria) =>
  `https://imdb-api.com/en/API/SearchMovie/${apikey}/${criteria}`

module.exports = { imdbUrl }
