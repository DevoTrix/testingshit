from flask import Flask, jsonify, request
import data as dc
import genMap as gm
app = Flask(__name__)
import asyncio
from flask_cors import CORS
CORS(app) 
@app.route('/')
def index():
    return 'Welcome to the Flask backend!'
import aqi

@app.route('/api/aqi', methods=['POST'])
def get_data():
    description = request.headers.get("description")
    b64String = aqi.generateAqi(description)
    data = {
        'message': 'This is some data from the Flask backend',
        'b64': b64String
    }
    return jsonify(data)

@app.route('/api/genMap', methods=['POST'])
async def genMap():
    pm_type = request.headers.get("pm_type")
    
    await gm.mapGeneration(pm_type)
    return jsonify({
        "message": "Map has generated"
    })



# Example route handling POST requests
@app.route('/api/pushDB', methods=['POST'])
async def create_post():

    tasks = [
        asyncio.create_task(dc.checkOffline()),
        asyncio.create_task(dc.updateAllHealth()),
        asyncio.create_task(dc.pushFullDB()),
        asyncio.create_task(dc.updateAllDataFraction())
    ]
    # Wait for all tasks to complete
    await asyncio.gather(*tasks)



if __name__ == '__main__':
    app.run(debug=True)