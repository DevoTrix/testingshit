const { Pool } = require("pg");
const http = require('http');
const apiKey = process.env.api_key;

const headers = {
    'Authorization': `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
    'Content-Type': 'application/json' // Adjust content type if needed
  };
  

const postgreConfig = {
    connectionString: process.env.POSTGRES_URL ,
};





async function pullDevice(){

    const url = `https://api.quant-aq.com/device-api/v1/devices/?network_id=9`
    console.log(url)
    const list = await fetch(url, {method:'GET', headers: headers})
    .then( response =>{
        if(!response.ok){
            throw new Error("Error Fetching Response: Network Response Not OK");
        }
        return response.json();
    })
    .then( data =>{
        return data.data;
    })
    .catch( error => {
        console.error("Fetch Operation failed: " + error);
        return null;
    });
    return list;
}


async function quer(query, values) {
    try {
        const pool = new Pool(postgreConfig);
        const con = await pool.connect();

        // Ensure values is an array
        const params = Array.isArray(values) ? values : [values];

        await con.query(query, params);
        await con.release();
    } catch (error) {
        console.error("Error pushing to DB: " + error);
    }
}

async function doLastSeen(){
    try{
        const data = await pullDevice();
        const list = data.map(row=>[row.sn, row.description, row.geo.lat, row.geo.lon, row.last_seen]);
        
        for(var i = 0; i < list.length; i++){
            quer("INSERT INTO Devices (sn,description, lat, lon, last_seen) VALUES (%s,%s, %s, %s, %s) ON CONFLICT (sn)  DO UPDATE SET lat = EXCLUDED.lat, lon = EXCLUDED.lon, last_seen = EXCLUDED.last_seen", list[0]);
        }
    } catch(error){
        console.error(error);
    }
}


module.exports = doLastSeen;