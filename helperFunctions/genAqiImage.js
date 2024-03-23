const Chart = require("chart.js");
const { Pool } = require("pg");
const postgreConfig = {
    connectionString: process.env.POSTGRES_URL ,
  };
async function retrieveData(description){
    var result;
    try{
        const pool = new Pool(postgreConfig);
        const con = await pool.connect();
        // offset is by # of hours in a day * #numer of minutes in an hour * number of seconds in a minute * number of millis in a second. then multiplied by the number of days.
        var offset = (24*60*60*1000) * 1;
        var threshold = new Date();
        threshold.setTime(threshold - offset);
        const threshstring = threshold.toISOString();
        const query = "SELECT Data.pm25, Data.pm10, timestamp FROM Data, Devices WHERE Data.sn = Devices.sn AND Devices.description = $1 AND timestamp > $2 ORDER BY timestamp";
        const value = [description, threshstring];
        const queryResponse = await con.query(query, value);
        await con.release();
        result = queryResponse.rows;
        return result;

    } catch(error){
        console.error("Error regarding Postgres: " + error);
        return null;
    }

}
async function generateImage(description){
    try{
        var result = await retrieveData(description);
        
        const data = {
            labels: result.map(row=>row.timestamp),
            datasets: [
                {
                label: 'pm2.5',
                borderColor: 'red',
                data: result.map(row=>row.pm25),
                fill: false
                }
            ]
        };
        const data2 = {
            labels: result.map(row=>row.timestamp),
            datasets: [
                {
                label: 'pm10',
                borderColor: 'blue',
                data: result.map(row=>row.pm10),
                fill: false
                }
            ]
        };
        return {data, data2};
    }catch(error){
        console.error(error);
    }
}
module.exports = generateImage;