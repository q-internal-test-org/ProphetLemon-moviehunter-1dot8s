const express = require('express')
const router = express.Router()
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

router.post('/', async (req, res) => {
    const response = await fetch(`https://api.themoviedb.org/3/search/person?api_key=${process.env.MOVIEDB_API}&language=${req.body.language}&query=${encodeURI(req.body.query)}&page=1&include_adult=false`);
    const data = await response.json();
    var texto = ""
    if (Array.isArray(data.results)) {

        data.results = data.results.splice(0, 5)
        for (let actor of data.results) {
            texto += `<option data-value="${actor.id}" value="${actor.name}" label="${actor.known_for_department}">`
        }
    } else if (data.results) {
        texto += `<option data-value="${data.results[0].id}" value="${data.results[0].name}" label="${data.results[0].known_for_department}">`
    }

    res.send(texto)
})

module.exports = router