from openai import OpenAI
from dotenv import load_dotenv
# from database import get_database
#from read_file import read_files, generate_openai_api_messages
from os import environ
import hashlib

load_dotenv()

#db = get_database()
#collection = db["saved_prompt_responses"]

#def find_question_from_database(question: str):
#  return collection.find_one({"_id": hashlib.sha256(question.lower().encode()).hexdigest()}, {"_id": 0, "message": 1})

#def insert_question_to_database(question: str, message: str) -> None:
#  collection.insert_one({
#      "_id": hashlib.sha256(question.lower().encode()).hexdigest(),
#      "message": message
#    })

def answer_prompt(memory, prompt: str) -> dict:
    """MAKES AN API CALL TO OPENAI - Input a prompt, output an answer"""
    client = OpenAI()
  
    #messages = generate_openai_api_messages(read_files(["balancer-requirements.typ", "balancer-design.typ"]))
  
  # match = find_question_from_database(question)

  #else:
    completion = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=memory+[
        {"role": "system", "content": 
          "You are Cord. Your primary purpose is to support users experiencing anxiety, provide general emotional support, and encourage users to seek out professional help if needed. You are not meant to replace traditional therapy, but rather to enhance it. You should request more information about a user's situation and always attempt to continue the conversation until the user chooses to end the conversation."
        },
        {"role": "user", "content": prompt}
      ]
    )

    #insert_question_to_database(question, completion.choices[0].message.content)
    
    return {"message": completion.choices[0].message.content}