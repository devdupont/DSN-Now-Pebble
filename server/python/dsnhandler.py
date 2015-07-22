#!/usr/bin/python3

import sys , json , xmltodict
if sys.version_info[0] == 2: import urllib2
elif sys.version_info[0] == 3: from urllib.request import urlopen

def stripKeys(aDict):
	for key in aDict:
		if type(aDict[key]) == dict: aDict[key] = stripKeys(aDict[key])
		elif type(aDict[key]) == list:
			for i in range(len(aDict[key])):
				aDict[key][i] = stripKeys(aDict[key][i])
		else: aDict[key.strip('@')] = aDict.pop(key)
	return aDict

dsnDataURL = 'https://eyes.nasa.gov/dsn/data/dsn.xml'
def getDSNData():
	try:
		if sys.version_info[0] == 2:
			response = urllib2.urlopen(dsnDataURL)
			xml = response.read()
		elif sys.version_info[0] == 3:
			response = urlopen(dsnDataURL)
			xml = response.read().decode('utf-8')
		retList = []
		while xml.find('<station') != -1:
			xml = xml[xml.find('<station'):]
			if xml.find('\t<station') != -1: closer = '\t<station'
			else: closer = '\t<timestamp'
			subString = '<item>\n\t'+xml[:xml.find(closer)]+'</item>'
			xml = xml[xml.find(closer):]
			subDict = json.loads(json.dumps(xmltodict.parse(subString)))
			#print(json.dumps(subDict['item'] , indent=4))
			subDict = stripKeys(subDict['item'])
			#print(json.dumps(subDict , indent=4))
			retList.append(subDict)
		if len(retList) > 0: return retList
		return 1
	except:
		return 0

def output(aDict):
	print(json.dumps(aDict , sort_keys=True))
	sys.exit()

dsnData = getDSNData()
print(json.dumps(dsnData , indent=4))

#If there has been an error so far
if type(dsnData) != list: output({'Error':'Fetch error with code ' + str(dsnData)})
#else: output({'DSN':dsnData})
