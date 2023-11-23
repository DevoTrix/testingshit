import os
from dotenv import load_dotenv
from data_call import data as dc
from pymongo import MongoClient
load_dotenv()
connection = os.environ['c_URI']
client = MongoClient(connection)
db = client["SSProject"]
collection = db["Devices"]

# testing code
# post = {"_id": 1, "SerialNumber": "test", "pm25": 10.5, "pm10": 12.5}
# collection.insert_one(post)
# add schemas here probably


def pushDB(data, schemas):
    #####################################################################
    # pushes data into the database                                     #
    # Parameters:                                                       #
    #   data: pandas dataframe from fetchData() check data.py           #
    #   schemas: the specific schema to upload data                     #
    #       Default: name is probably gonna be schema which stores in   #
    #           the default columns of sn lon lat pm25 pm10 timestamp   #
    # Return:                                                           #   
    #####################################################################
    return

def pullData(serialNumber):
    ######################################################################
    # pulls all data from database of a specific serial number           #
    # PARAMETERS:                                                        #
    #   serialNumber: the serial number of the data you want             #
    # Return:                                                            #
    #   data: returns a dson/ dataframe/ list / dictionary of the data   #
    ######################################################################
    data = []
    return data

def updateData(serialNumber, newData):
    ######################################################################
    # updates the data of a specific database                            #
    # Parameters:                                                        #
    #   serialNumber: the serial number of the device needs updating     #
    #   newData: dictionary of the new data needed                       #
    # Return:                                                            #
    ######################################################################
    return

def updateAllData():
    ######################################################################
    # updates everything                                                 #
    # Parameters:                                                        #
    # Return:                                                            #
    ######################################################################
