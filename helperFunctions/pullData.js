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




async function grabsnLastSeen(){
    try{
        var pool = new Pool(postgreConfig);
        const con = await pool.connect();
        const query = "SELECT sn, last_seen FROM Devices;"
        const rows = await con.query(query);
        const data = rows.rows;
        await con.release();
        return data;
    } catch(error){
        console.error("Error Pulling from db: " + error);
    }
}
async function grabUnique(){
    try{
        var pool = new Pool(postgreConfig);
        const con = await pool.connect();
        const query = "SELECT sn FROM Devices;"
        const rows = await con.query(query);
        const data = rows.rows;
        await con.release();
        return data;
    } catch(error){
        console.error("Error Pulling from db: " + error);
    }
}
async function pullSpecific(serialNumber, last_seen){
    const date = last_seen.split("T")[0]
    const dateO = new Date(date);
    dateO.setDate(dateO.getDate() - 1);
    const date1 = dateO.toISOString().split("T")[0].toLocaleString();
    const dateobj = dateO;
    dateobj.setDate(dateO.getDate() + 1);
    const enddate = dateO.toISOString().split("T")[0].toLocaleString();
    console.log(enddate);
    const url = `https://api.quant-aq.com/device-api/v1/data/resampled/?sn=${serialNumber}&start_date=${date1}&end_date=${enddate}&period=1h`
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
async function pullDataFraction(sn, last_seen){
    const date = last_seen.split("T")[0]
    const url = `https://api.quant-aq.com/device-api/v1/devices/${sn}/data-by-date/${date}/?network_id=9`
    console.log(url)
    const list = await fetch(url, {method:'GET', headers: headers})
    .then( response =>{
        if(!response.ok){
            throw new Error("Error Fetching Response: Network Response Not OK");
        }
        return response.json();
    })
    .then( data =>{
        return data.meta;
    })
    .catch( error => {
        console.error("Fetch Operation failed: " + error);
        return null;
    });
    return list;
}
async function updateQuery(query, values){
    try{
        const pool = new Pool(postgreConfig);
        const con = await pool.connect();
        await con.query(query, values);
        await con.release();
        console.log("updated")
    }
    catch(error){
        console.error("Error updating " + error);
    }
}
// had to get it optimize it through batches
async function pushData() {
    var data = await grabsnLastSeen();

    console.log(data);
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i++) {
        try {
            const list = await pullDataFraction(data[i].sn, data[i].last_seen);
            // if (!list) {
            //     continue;
            // }
            // const rows = list.map(row => [row.sn, row.total]);
            console.log(list)
            // Batch insert into the database
            fraction = list.total / 1440;
            const query = "UPDATE Devices SET dataFraction = $1 WHERE sn = $2";
            const value = [fraction, data[i].sn];
            await updateQuery(query, value);
            // console.log(`Inserted ${rows.length} rows into database on index ${i} out of ${dataLength}`);
        } catch (error) {
            console.error("Error loading data: " + error);
        }
    }
}


async function pullData() {
    var data = await grabsnLastSeen();

    // Set a batch size for batch inserts
    const batchSize = 48;
    const dataLength = data.length;

    for (let i = 0; i < dataLength; i++) {
        try {
            const list = await pullSpecific(data[i].sn, data[i].last_seen);
            // if (!list) {
            //     continue;
            // }
            const filteredRows = list.filter(row => row.pm25 !== null && row.pm10 !== null);
            const rows = filteredRows.map(row => [row.sn, row.pm25, row.pm10, row.period_start]);
            console.log(list)
            // Batch insert into the database
            for (let j = 0; j < rows.length; j += batchSize) {
                const batchRows = rows.slice(j, j + batchSize);

                // Prepare placeholders for parameterized query
                const placeholders = batchRows.map((row, index) => `($${index * 4 + 1}, $${index * 4 + 2}, $${index * 4 + 3}, $${index * 4 + 4})`).join(',');

                // Generate parameterized query
                const query = `INSERT INTO Data (sn, pm25, pm10, timestamp) VALUES ${placeholders} ON CONFLICT (sn, timestamp) DO UPDATE SET pm25 = EXCLUDED.pm25, pm10 = EXCLUDED.pm10`;

                

                // Flatten batchRows to pass as parameters
                const flatBatchRows = batchRows.reduce((acc, val) => acc.concat(val), []);

                // Execute the batch insert query
                await quer(query, flatBatchRows);
            }

            console.log(`Inserted ${rows.length} rows into database on index ${i} out of ${dataLength}`);
        } catch (error) {
            console.error("Error loading data: " + error);
        }
    }
}

async function clearOldData(){
    try{
        const pool = new Pool(postgreConfig);
        const con = await pool.connect();
        var dateO = new Date();
        dateO.setDate(dateO.getDate() - 365);
        const ayear = dateO.toISOString();
        const values = [ayear]
        const query = "DELETE FROM Data WHERE timestamp < $1"
        await con.query(query, values);
        await con.release();
    }catch(error){
        console.error("Error Removing old data" + error);
    }
}




async function getRaw(sn){

    const url = `https://api.quant-aq.com/device-api/v1/devices/${sn}/data/raw/?network_id=9`
    // console.log(url)
    const list = await fetch(url, {method:'GET', headers: headers})
    .then( response =>{
        if(!response.ok){
            throw new Error("Error Fetching Response: Network Response Not OK");
        }
        return response.json();
    })
    .then( data =>{
        // console.log(data.data);
        return data.data;
    })
    .catch( error => {
        console.error("Fetch Operation failed: " + error);
        return null;
    });
    return list;
}


async function updateHealth() {
    var data = await grabUnique();

    console.log(data);
    const dataLength = data.length;
    const opc_flag = 2
    const neph_flag = 4
    const sd_flag = 8192

    for (let i = 0; i < dataLength; i++) {
        try {
            const list = await getRaw(data[i].sn);
            // if (!list) {
            //     console.log("Nothing")
            //     continue;
            // }
            console.log(list)
            const rows = list.map(row => [row.sn, row.flag]);
            console.log(rows);
            // Batch insert into the database
            const curflag = rows[0][1];
            const opcHealthnum = (curflag & opc_flag);
            const nephHealthnum = (curflag & neph_flag);
            const sdhealthnum = (curflag & sd_flag);
            const pmhealth = "ACTIVE"
            if(opcHealthnum != 0 || nephHealthnum != 0){
                pmhealth = "ERROR"
            }
            sdhealth = "ACTIVE"
            if(sdhealthnum != 0){
                sdhealth = "ERROR"
            }
            console.log(pmhealth)
            const query = "Update Devices SET pmHealth = $1, sdHealth = $2 WHERE sn = $3"
            const values = [pmhealth, sdhealth, rows[0][0]]
            await updateQuery(query, values);
        } catch (error) {
            console.error("Error loading data: " + error);
        }
    }
}










module.exports = {pullData, pushData, clearOldData, updateHealth};