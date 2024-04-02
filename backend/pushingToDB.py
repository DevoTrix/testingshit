import dbMfunctions as dc

def updateDBs():
    dc.checkOffline()
    dc.updateAllHealth()
    dc.updateAllDataFraction()
    dc.pushFullDB()
    print('ok')
# updateDBs()
