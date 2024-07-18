from flask import Flask, request
import requests

app = Flask(__name__)

rasa_address = "http://0.0.0.0:5005/webhooks/rest/webhook"

@app.route("/chat", methods=["POST"])
def chat():
    res = requests.post(rasa_address, json=request.get_json())
    return res.json()