from pymongo.mongo_client import MongoClient
from pymongo.server_api import ServerApi

def get_database():
    uri = "mongodb+srv://cjrkoa:6ruUrKn2zotAZkAm@cord.arv6tit.mongodb.net/?retryWrites=true&w=majority&appName=Cord"

    # Create a new client and connect to the server
    client = MongoClient(uri, server_api=ServerApi('1'))

    # Send a ping to confirm a successful connection
    try:
        client.admin.command('ping')
        return client["cord"]
    except Exception as e:
        print(e)
        return None
