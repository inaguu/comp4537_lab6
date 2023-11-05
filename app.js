const query_check = "SELECT word FROM entry WHERE word ="
const query_lang = "SELECT * FROM language"
const query_get = "SELECT * FROM entry WHERE word ="
const query_post = "INSERT INTO entry (word, definition, word_lang, definition_lang) VALUES"
const query_patch = "UPDATE entry SET"
const query_delete = "DELETE FROM entry WHERE word ="
const entry_not_found = "Entry not found"
const entry_created_successfully = "Entry created successfully"
const entry_updated_successfully = "Entry updated successfully"
const entry_deleted_successfully = "Entry deleted successfully"
const word_conflict = "Word conflict"
const entry_missing_two = "Entry missing {word, definition}"
const entry_missing_oneWord = "Entry missing {word}"
const entry_missing_oneDefinition = "Entry missing {definition}"

const mysql = require("mysql")
const express = require("express")
const app = express()
const port = 3000

const con = mysql.createPool ({
    host: "sql.freedb.tech",
    user: "freedb_comp3920_iang",
    password: "suc2&%7*a%D4brU",
    database: "freedb_comp3920NodeJS"
})

const query = (sql) => {
    return new Promise((resolve, reject) => {
        con.query(sql, (err, rows) => {
            if(err) {
                return reject(err);
            }           
            return resolve(rows)
        })
    }) 
}

async function wordCheck(word) {
    let sql_query = `${query_check} '${word}'`

    let result = await query(sql_query)

    if (result.length == 0) {
        return true
    } else {
        return false
    }
}

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Methods', 'GET, PATCH, POST, DELETE, OPTIONS')
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With')
    next()
})

app.get("/api/v1/languages", (req, res) => {
    con.query(query_lang, (err, result) => {
        if (err) {
            res.status(404).send(JSON.stringify(err))
        }
        console.log(result)
        res.status(200).send(JSON.stringify(result))
    })
})

app.get("/api/v1/definition/:word", async (req, res) => {
    let sql_query = `${query_get} '${req.params.word}'`

    let result = await query(sql_query)

    // no word in database
    if (result.length == 0) {
        res.status(404).send(JSON.stringify({error: entry_not_found, message: `The word ${req.params.word} does not exists`, entry: {word: req.params.word}}))
    } else { // word is in database
        res.status(200).send(JSON.stringify(result))
    }
})

app.post("/api/v1/definition", (req,res) => {
    let body = ""
        
    req.on('data', function(chunk) {
        if (chunk != null) {
            body += chunk
        }
    })

    req.on("end", async () => {
        let data = JSON.parse(body)
        
        let word = data.word
        let definition = data.definition
        let word_lang = data.wordLanguage
        let definition_lang = data.definitionLanguage

        if (word === "" && definition === "") {
            res.status(400).send(JSON.stringify({message: entry_missing_two, action: "missing", entry: {word: word, definition: definition, word_lang: word_lang, definition_lang: definition_lang}}))
            return
        } else if (word === "") {
            res.status(400).send(JSON.stringify({message: entry_missing_oneWord, action: "missing", entry: {word: word, definition: definition, word_lang: word_lang, definition_lang: definition_lang}}))
            return
        } else if (definition === "") {           
            res.status(400).send(JSON.stringify({message: entry_missing_oneDefinition, action: "missing", entry: {word: word, definition: definition, word_lang: word_lang, definition_lang: definition_lang}}))
            return
        }

        // true if word does not exist
        if (await wordCheck(word)) {
            let query = `${query_post} ('${word}', '${definition}', '${word_lang}', '${definition_lang}')`
            con.query(query, (err, result) => {
                if (err) {
                    console.log(err)
                    res.status(400).send(JSON.stringify(err))
                }
                console.log(result)
                res.status(201).send(JSON.stringify({message: entry_created_successfully, action: "inserted", entry: {word: word, definition: definition, word_lang: word_lang, definition_lang: definition_lang}}))
            })
        } else { // false if word does exist
            res.status(409).send(JSON.stringify({error: word_conflict, message: `The word ${word} already exists`, action: "update", entry: {word: word, definition: definition, word_lang: word_lang, definition_lang: definition_lang}}))
        }
    })
})

app.patch("/api/v1/definition/:word", (req, res) => {
    let body = ""
        
    req.on('data', function(chunk) {
        if (chunk != null) {
            body += chunk
        }
    })

    req.on("end", () => {
        let data = JSON.parse(body)

        let word = req.params.word
        let definition = data.definition
        let word_lang = data.wordLanguage
        let definition_lang = data.definitionLanguage

        let query = `${query_patch} definition = '${definition}', word_lang = '${word_lang}', definition_lang = '${definition_lang}' WHERE word = '${word}'`

        con.query(query, (err, result) => {
            if (err) {
                console.log(err)
                res.status(400).send(JSON.stringify(err))
            }
            console.log(result)
            res.status(200).send(JSON.stringify({message: entry_updated_successfully, entry: {word: word, definition: definition, word_lang: word_lang, definition_lang: definition_lang}}))
        })
    })
})

app.delete("/api/v1/definition/:word", async (req, res) => {
    let sql_query = `${query_delete} '${req.params.word}'`

    let result = await query(sql_query)

    console.log(result)

    if (result.affectedRows == 0) {
        res.status(404).send(JSON.stringify({error: entry_not_found, message: `The word ${req.params.word} does not exists`, entry: {word: req.params.word}}))
    } else {
        res.status(200).send(JSON.stringify({message: entry_deleted_successfully, entry: {word: req.params.word}}))
    }
})

app.listen(port, () => {
	console.log("Node application listening on port " + port);
});
