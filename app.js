const query_check = "SELECT word FROM dictionary WHERE word = "



const http = require('http')
const url = require("url")
const mysql = require("mysql")
const port = 3000

let req_count = 0;

const con = mysql.createPool ({
    host: "sql.freedb.tech",
    user: "freedb_comp3920_iang",
    password: "suc2&%7*a%D4brU",
    database: "freedb_comp3920NodeJS"
})

function wordCheck(word) {
    let query = query_check + word
    con.query(query, (err, result) => {
        if (err) {
            res.writeHead(400, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'})
            res.end("You got an SQL error, please check your SQL query")
        }
        console.log(result)
    })
}




http.createServer((req, res) => {
    let q = url.parse(req.url, true) 
    let pathname = q.pathname

    if (req.method === "OPTIONS") {
        res.writeHead(200, {
            'access-control-allow-origin': '*',
            'access-control-allow-methods': 'GET, POST, OPTIONS',
            'access-control-allow-headers': 'Content-Type'
        })
        res.end()

    } else if (req.method === "POST" && pathname.includes("/api/v1/definition") ) {
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
            let word_lang = data.word_language
            let definition_lang = data.definition_language

            if (wordCheck(word)) {
 
            } else {

            }

            con.query(data.query, (err, result) => {
                if (err) {
                    res.writeHead(400, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'})
                    res.end("You got an SQL error, please check your SQL query")
                }
                console.log(result)
                res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'})
                res.end("We got your POST request")
            })
        })
    } else {
        res.writeHead(200, {'Content-Type': 'text/html', 'Access-Control-Allow-Origin': '*'})
        res.write("<p>home page</p>")
        res.end()
    }

}).listen(port)

console.log("Server is running and listening on port: " + port)

// for sending data
// res.end(JSON.stringify({response: `We got your GET request`, result}))