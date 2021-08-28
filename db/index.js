const mysql = require('mysql');
const reader = require('xlsx');
const bcrypt = require('bcrypt')

const options = {
    connectionLimit: 10,
    host:"remotemysql.com",
    user:"zTTn4mC4al",
    password:"yah77VSVzC",
    database:"zTTn4mC4al",
    port: 3306
}

var con = mysql.createPool(options);

let mydb = {};

mydb.writeSession = async ({token}, email) => {
    return new Promise((resolve , reject) => {
        con.query("INSERT INTO sessions VALUES (?, ?)",[token,email], (err, results) => {
            if(err) {
                reject(err)
                console.log(err)
            } else {
                resolve({session: true})
            }
        })
    })
}

mydb.deleteSession = (token) => {
    return new Promise((resolve, reject) => {
        con.query("DELETE FROM sessions WHERE token = ?",token,(err, results) => {
            if(err) reject(err)
            else {
                resolve(true)
            }
        })
    })
}

mydb.readSession = (token) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT email FROM sessions WHERE token = ?", token,(err,results) => {
            if(err) reject(err)
            else {
                if(results.length > 0) resolve(results[0].email)
                else resolve(false)
            }
        })
    })
}

mydb.readUserName = (email) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT ime, prezime FROM users WHERE email=?", email, (err,results) => {
            if (err) reject(err)
            else resolve(results[0])
        })
    })
}

mydb.readUserRole = (email) => {
    return new Promise((resolve, reject) => {
        con.query("SELECT role FROM users WHERE email=?", email, (err, results) => {
            if(err) reject(err)
            else resolve(results[0])
        })
    })
}

mydb.proba = (data) => {
    let query = 'SELECT FIRSTNAME, NAME, PHONE, EMAIL, CITY, STREET, HAUSNUMMER, AREAPOP, DP, HBFinish, TIEFBAUFINISH FROM korisnici ';
    let i=0;
    for(const property in data){
        if(i==0){
            if(data[property]){
                query += `WHERE ${property}="${data[property]}"`
                console.log(query)
                i++;
            }
        }else{
            if(data[property]){
                query += ` AND ${property}="${data[property]}"`
                console.log(query)
            }
        }
    }
    return new Promise((resolve, reject) => {
        con.query(query,
        (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.updateData = (data) => {
    // console.log(data.TIEFBAUDatum)
    // console.log(data.FIRSTNAME)
    // console.log(data.NAME)

    let query = `UPDATE korisnici SET `;
    let queryWhere = ` WHERE FIRSTNAME="${data.FIRSTNAME}" AND NAME="${data.NAME}"`;
    let i=0;
    for(const property in data){
        if(i==0){
            if(data[property]){
                console.log(property)
                if(property==='COMMENT') query += `COMMENT = concat(COMMENT, '; ', '${data[property]}')`
                else query += `${property}="${data[property]}"`
                // console.log(query)
                i++;
            }
        }else{
            if(data[property]){
                console.log(property)
                if(property==='COMMENT') query += `, COMMENT = concat(COMMENT, '; ', '${data[property]}')`
                else query += `, ${property}="${data[property]}"`
                // console.log(query)
            }
        }
    }
    query+=queryWhere;

    return new Promise((resolve, reject) => {
        con.query(query, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.tableAll = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT FIRSTNAME, NAME, PHONE, EMAIL, CITY, STREET, HAUSNUMMER, AREAPOP, DP, HBFinish, TIEFBAUFINISH FROM korisnici`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}


mydb.add = (data) => {
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO Users VALUES ("${data.FirstName}","${data.Surname}","${data.Email}","${data.Roll}","${data.Password}")`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.manage = (data) => {
    return new Promise((resolve, reject) => {
        con.query(`UPDATE Users SET Email="${data.Email}",Password="${data.Password}" WHERE FirstName="Emir"`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.all = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.register = (data) => {
    data.splice(5);
    return new Promise((resolve, reject) => {
        con.query(`INSERT INTO users (ime, prezime, email, role, password) VALUES(?)`,
          [data],(err, result)=> {
            if (err) reject(err)
            else resolve(result)
        })
    })
}

 mydb.login = (data) => {
     if(data.body.length !== 2 ) return("try again");
    
    return new Promise((resolve, reject) => {
        con.query(`SELECT * FROM users WHERE email=?`, data.body[0], 
        (err, results) =>{
            if (err) console.log(err)
            else {
                bcrypt.compare(data.body[1], results[0].password, (err,same) => {
                    if(err) reject(err)
                    if(same) resolve(results[0])
                });
            }
        })
    })
 }



/*mydb.excelInsert = () => { //putanja fajla
    return new Promise((resolve, reject) => {

        const file = reader.readFile('data/customers.xlsx') //ovdje je unesemo
        let data = []
        const sheets = file.SheetNames
        
        for(let i = 0; i < sheets.length; i++)
        {
        const temp = reader.utils.sheet_to_json(
                file.Sheets[file.SheetNames[i]])
        temp.forEach((res) => {
            data.push(res)
        })
        }

        for (let i = 50; i < 85; i++) { // i < data.length
    
            con.query(`INSERT INTO korisnici (FIRSTNAME, NAME, PHONE, EMAIL, CO_ID, CITY, STREET, HAUSNUMMER, DP, AREAPOP, TZIP, TFVOM, FVOM, DPGVom, HBVOM, MVOM, AVOM, TIEFBAUFINISH, FFINISH, DPFinish, POPFinish, HBFinish, MFINISH, AKTIVIRUNGFINISH) VALUES ("${data[i].FIRSTNAME}", "${data[i].NAME}", "${data[i].PHONE}", "${data[i].EMAIL}", "${data[i].CO_ID}", "${data[i].CITY}", "${data[i].STREET}", "${data[i].HAUSNUMMER}", "${data[i].DP}", "${data[i].AREAPOP}", "${data[i].TZIP}", "${data[i]['TIEFBAU Vom']}", "${data[i]['F VOM']}", "${data[i]['DPG Vom']}", "${data[i]['HB VOM']}", "${data[i]['M VOM']}", "${data[i]['A VOM']}", "${data[i]['TIEFBAU FINISH']}", "${data[i]['F FINISH (x)']}", "${data[i]['DP Finish (X)']}", "${data[i]['POP Finish (X)']}", "${data[i]['HB Finish (X)']}", "${data[i]['M FINISH (X)']}", "${data[i]['AKTIVIRUNG FINISH (X)']}")`, (err, results) => {
                if (err) reject(err)
                else if(i==84) resolve(results) // i==data.length-1
            })
            
        }
    })
}*/



mydb.hausbegehungTable = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT HBFinish, HBDatum, HBTermin, FIRSTNAME, NAME, PHONE, CITY, STREET, HAUSNUMMER, ZUSAT FROM korisnici`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.tiefbauTable = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT HBFinish, TIEFBAUFINISH, TIEFBAUDatum, FIRSTNAME, NAME, CITY, STREET, HAUSNUMMER, ZUSAT, AREAPOP, DP FROM korisnici`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.faserTable = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT TIEFBAUFINISH, FFINISH, FDatum, FIRSTNAME, NAME, CITY, STREET, HAUSNUMMER, ZUSAT, AREAPOP, DP FROM korisnici`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.miaTable = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT TIEFBAUFINISH, FFINISH, MFINISH, MONTAZEDATUM, MTERMIN, AKTIVIRUNGFINISH, AKTIVIRUNGDATUM, AKTIVIRUNGTERMIN, FIRSTNAME, NAME, PHONE, CITY, STREET, HAUSNUMMER, ZUSAT, AREAPOP, DP FROM korisnici`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

mydb.vermessungTable = () => {
    return new Promise((resolve, reject) => {
        con.query(`SELECT TIEFBAUFINISH, VermessungFinish, VermessungDatum, FIRSTNAME, NAME, PHONE, CITY, STREET, HAUSNUMMER, ZUSAT, AREAPOP, DP FROM korisnici`, (err, results) => {
            if (err) reject(err)
            else resolve(results)
        })
    })
}

module.exports = mydb;