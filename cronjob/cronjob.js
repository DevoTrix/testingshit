const cron = require('node-cron');
const {pullData, pushData, clearOldData, updateHealth} = require("../helperFunctions/pullData.js");
async function job(){
    await pullData();
    await pushData();
    await clearOldData();
    await updateHealth();
}

cron.schedule('0 */6 * * *', async ()=>{
    await job()
});