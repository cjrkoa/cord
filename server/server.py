from flask import Flask, request, jsonify
from flask_cors import CORS
from database import get_database
from werkzeug.security import generate_password_hash, check_password_hash
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity, decode_token
from gpt_wrapper import generate_response, system_prompts, process_audio
from datetime import datetime, timedelta
from flask_mail import Mail, Message
from dotenv import load_dotenv
from os import getenv
from sklearn.feature_extraction.text import TfidfVectorizer
from compute_sentence_score import compute_sentence_scores, compute_trust_score, is_meaningful, trust_dict, vad_dict, score_to_string
import random
import joblib

load_dotenv()

app = Flask(__name__)
CORS(app)

db = get_database()

vectorizer = joblib.load("vectorizer.joblib")
prompt_injection_classifier = joblib.load("prompt_injection_detection.joblib")

# Setup the Flask-JWT-Extended extension
app.config["JWT_SECRET_KEY"] = getenv("JWT_SECRET_KEY")
jwt = JWTManager(app)

# JWT Configuration
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 900 # 15 minute expiration
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = 604800 # 7 day expiration

# Configure Flask-Mail
app.config['MAIL_SERVER'] = 'live.smtp.mailtrap.io'  # e.g., 'smtp.gmail.com'
app.config['MAIL_PORT'] = 587  # Use 465 for SSL
app.config['MAIL_USE_TLS'] = True  # or False for SSL
app.config['MAIL_USE_SSL'] = False  # or True for SSL
app.config['MAIL_USERNAME'] = 'smtp@mailtrap.io'  # Your email
app.config['MAIL_PASSWORD'] = 'a9879b8a0f50bc345962d22067407941'  # Your email password
app.config['MAIL_DEFAULT_SENDER'] = 'hello@demomailtrap.com'  # Default sender

mail = Mail(app)

def generate_verification_token(email):
    expiration = timedelta(hours=24)  # Token valid for 24 hours
    return create_access_token(identity=email, expires_delta=expiration)

@app.route("/")
def health_check():
    return jsonify({"msg": "Connected Successfully"}), 200

@app.route("/chat", methods=["POST"])
def chat():
    message = request.get_json()["message"]
    username = request.get_json()["username"]

    proba = prompt_injection_classifier.predict_proba(vectorizer.transform([message]))[0][1]

    #if is_meaningful(message) and proba > 0.95:
    #    return jsonify({"message": ["Sorry! Something went wrong."]})

    affect = {}
    
    user = db["users"].find_one({"username": username})
    affect_raw = user.get("affect_raw", [])

    # only compute affect of meaningful messages because attempting to compute score of short strings runs the risk of trying to compute score of an empty string (this will crash the server)
    if is_meaningful(message):
        affect = compute_sentence_scores(message, vad_dict, weight_distribution="quadratic")
        if affect_raw is not None:
            affect["trust"] = compute_trust_score(message, len(affect_raw), trust_dict)
        else: affect["trust"] = compute_trust_score(message, 0, trust_dict)
    else:
        affect = {
            "valence": 0.5,
            "arousal": 0.5,
            "dominance": 0.5,
            "trust": 0,
        }

    memory = []
    for item in request.get_json()["memory"]:
        sys_prompt = {
            "role": "system",
            "content": item["type"] + ": " + item["text"]
        }
        memory.append(sys_prompt)

    response = []
    response.append(generate_response(memory, message, system_prompts["old"]).splitlines())

    # self-care directive for trust building
    if random.random() <= 0.03 and affect["valence"] < 0.55 and is_meaningful(message):
        response.append(generate_response([], message, "Provide a relevant one sentence self-care directive to the user based on their prompt. Show warmth."))
    
    if affect_raw is not None:
        affect_raw.append(score_to_string(affect))
    else: affect_raw = [score_to_string(affect)]

    if is_meaningful(message):
        db["users"].find_one_and_update(
            {"username": username}, 
            {"$set": {"affect_raw": affect_raw}}
        )

    return jsonify({"message": response})


@app.route("/register", methods=["POST"])
def register():
    data = request.get_json()
    username = data.get("username")
    email = data.get("email")
    password = data.get("password")

    if db is not None and db["users"].find_one({"username": username}) or db["users"].find_one({"email": email}):
        return jsonify({"msg": "User already exists"}), 409

    hashed_password = generate_password_hash(password)
    db["users"].insert_one({"username": username, "email": email, "password": hashed_password, "is_verified": True, "affect_profile": score_to_string({"valence": 0.5, "arousal": 0.5, "dominance": 0.5, "trust": 0.5}), "affect_raw": []}) # DONT FORGET TO CHANGE is_verified BACK TO FALSE AFTER PILOT TEST

    # Generate verification token
    try:    
        token = generate_verification_token(email)
    
        # Construct verification link
        verification_link = f'https://flask-service.dkbedazshkb3y.us-east-1.cs.amazonlightsail.com/verify/{token}'

        # Send verification email
        msg = Message("Verify your email address", recipients=[email])
        msg.body = f'Thank you for signing up to use Cord! :)\nVerify your account by clicking the link below:\n{verification_link}'
        mail.send(msg)
    except:
        pass

    return jsonify({"msg": "User registered successfully, check your email to verify"}), 201

@app.route('/verify/<token>', methods=['GET'])
def verify_email(token):
    try:
        # Decode the token using flask_jwt_extended
        decoded = decode_token(token)
        email = decoded['sub']
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError):
        return jsonify({"msg": "Invalid or expired token"}), 400

    user = db["users"].find_one({"email": email})
    
    if user:
        if not user.get('is_verified', False):
            # Update the user's verification status
            db["users"].update_one({"email": email}, {"$set": {"is_verified": True}})
            return jsonify({"msg": "Email verified, you can now log in"}), 200
        else:
            return jsonify({"msg": "User already verified"}), 400
    else:
        return jsonify({"msg": "User doesn't exist"}), 404

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()
    username = data.get("username")
    password = data.get("password")

    user = db["users"].find_one({"username": username})

    if user and check_password_hash(user["password"], password) and user["is_verified"] == True:
        access_token = create_access_token(identity=str(user["_id"]))
        refresh_token = create_refresh_token(identity=str(user["_id"]))
        return jsonify({
            "access_token": access_token,
            "refresh_token": refresh_token
        }), 200
    
    return jsonify({"msg": "Invalid credentials"}), 401

@app.route("/delete_user", methods=["POST"])
def delete_user():
    data = request.get_json()
    username = data.get("username")

    user = db["users"].find_one({"username": username})

    if user:
        db["users"].delete_one(user)
        return jsonify({"msg": "User sucessfully removed from database"}), 200
    return jsonify({"msg": "Invalid username"}), 400

@app.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)  # Only allow refresh tokens
def refresh():
    current_user = get_jwt_identity()
    new_access_token = create_access_token(identity=current_user)
    new_refresh_token = create_refresh_token(identity=current_user)
    return jsonify({
        "access_token": new_access_token,
        "refresh_token": new_refresh_token
    }), 200

@app.route("/upload_conversation", methods=["POST"])
@jwt_required()
def upload_conversation():
    try:
        db["conversations"].insert_one(request.get_json())
        return jsonify({"msg": "Conversation uploaded successfully"}), 201
    except:
        return jsonify({"msg": "Error uploading conversation"}), 400

@app.route("/upload_feedback", methods=["POST"])
@jwt_required()
def upload_feedback():
    try:
        db["feedback"].insert_one(request.get_json())
        return jsonify({"msg": "Feedback uploaded successfully"}), 201
    except:
        return jsonify({"msg": "Error uploading feedback"}), 400

@app.route("/evaluate_text_emotion", methods=["POST"])
@jwt_required()
def evaluate_text_emotion():
    #current_user = get_jwt_identity()
    message = request.get_json()["message"]
    if is_meaningful(message):
        emotion = compute_sentence_scores(message, vad_dict)
        emotion["trust"] = compute_trust_score(message, 0, trust_dict)
    
        return jsonify(emotion)
    else:
        return jsonify({"msg": "Affect was not calculated because message was not meaningful"}), 200

@app.route("/transcribe_audio", methods=["POST"])
def transcribe_audio():
    if "audio" not in request.files:
        return jsonify({"error": "No audio file part"}), 400

    audio_file = request.files["audio"]

    processed = process_audio(audio_file)

    return jsonify({"transcription": processed})

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
    app.run(host="0.0.0.0", port=5000)