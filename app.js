const query_check = "SELECT word FROM entry WHERE word ="



const http = require('http')
const url = require("url")
const mysql = require("mysql")
const express = require("express")
const app = express()
const port = 3000

let req_count = 0;

const con = mysql.createPool ({
    host: "sql.freedb.tech",
    user: "freedb_comp3920_iang",
    password: "suc2&%7*a%D4brU",
    database: "freedb_comp3920NodeJS"
})

function wordCheck(word) {
    let query = `${query_check} '${word}'`
    console.log(query)

    let sql_result = []

    con.query(query, (err, result) => {
        if (err) {
            console.log(err)
        }
        console.log(result)
    })
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Header', 'GET, PATCH, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next()
})

app.get("/api/v1/languages", (req, res) => {
    let query = "SELECT * FROM language"

    con.query(query, (err, result) => {
        if (err) {
            res.status(404).send("There is an error getting all the languages")
        }
        console.log(result)
        res.status(200).send(JSON.stringify(result))
    })
})

app.post("/api/v1/definition", (req,res) => {
    let body = ""
        
    req.on('data', function(chunk) {
        if (chunk != null) {
            body += chunk
        }
    })

    req.on("end", () => {
        let data = JSON.parse(body)
        
        let word = data.word
        let definition = data.definition
        let word_lang = data.wordLanguage
        let definition_lang = data.definitionLanguage

        // true if word does not exist
        if (wordCheck(word)) {
            console.log("putting word into database")
            let query = `INSERT INTO entry (word, definition, word_lang, definition_lang) VALUES (${word}, ${definition}, ${word_lang}, ${definition_lang})`
            con.query(query, (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(404).send("There is an error inserting an entry")
                }
                console.log(result)
                res.status(200).send(`Successfully inserted ${word}`)
            })

        } else { // false if word does exist

        }
    })
})

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});

// for sending data
// res.end(JSON.stringify({response: `We got your GET request`, result}))