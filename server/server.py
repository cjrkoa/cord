from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_database
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
import requests
from gpt_wrapper import answer_prompt

app = Flask(__name__)
CORS(app)

db = get_database()

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = "super-secret" # TODO: Change this (it's fine for now)
jwt = JWTManager(app)

@app.route("/chat", methods=["POST"])
def chat():
    memory = []
    for item in request.get_json()["memory"]:
        sys_prompt = {
            "role": "system",
            "content": item["type"] + ": " + item["text"]
        }
        memory.append(sys_prompt)


    return answer_prompt(memory, request.get_json()["message"])

@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if db["users"].find_one({"username": username}):
        return jsonify({"msg": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    db["users"].insert_one({"username": username, "email": email, "password": hashed_password})

    return jsonify({"msg": "User registered successfully"}), 201

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    user = db["users"].find_one({"username": username})

    if user and check_password_hash(user["password"], password):
        access_token = create_access_token(identity=str(user["_id"]))
        return jsonify(access_token=access_token), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route("/upload_conversation", methods=["POST"])
def upload_conversation():
    try:
        db["conversations"].insert_one(request.get_json())
        return jsonify({"msg": "Conversation uploaded successfully"}), 201
    except:
        return jsonify({"msg": "Error uploading conversation"}), 400

# Protect a route with jwt_required, which will kick out requests
# without a valid JWT present.
@app.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    # Access the identity of the current user with get_jwt_identity
    current_user = get_jwt_identity()
    print(current_user)
    return jsonify(logged_in_as=current_user), 200

if __name__ == "__main__":
    app.run()