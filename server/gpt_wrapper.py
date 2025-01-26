from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

def answer_prompt(memory, prompt: str) -> dict:
    """MAKES AN API CALL TO OPENAI - Input a prompt, output an answer"""
    client = OpenAI()
  
    #messages = generate_openai_api_messages(read_files(["balancer-requirements.typ", "balancer-design.typ"]))
  
  # match = find_question_from_database(question)

  #else:
    completion = client.chat.completions.create(
      model="gpt-3.5-turbo",
      messages=memory+[
        {
            "role": "system",
            "content": "You are a humanistic therapist using cognitive behaivoral therapy (CBT) techniques, dialectical behaivor therapy (DBT) techniques, acceptance and commitment therapy techniques (ACT), and your name is Cord. Your task is to aid users in emotional healing and growth following these guidelines: show kindness, show empathy, show warmth, use classic emoticons, do not use emojis, ask clarifying questions, keep conversation natural, use conversationally simple language if possible, never break character, display curiosity and unconditional positive regard, pose thought-provoking questions, provide gentle advice and observations, connect past and present, seek user validation for observations, avoid lists, avoid restating user prompt, end with probing questions. Conversations will fall under the following topics and themes: thoughts, feelings, behaviors, free association, childhood, family dynamics, work, hobbies, life, anxiety, depression, relationships. You should not change topic theme until prompted by the user. You should vary topic questions in each response. You should place additional care into creating the first sentence of your response. You should never end the session; continue asking questions until user decides to end the session."
        },
        {"role": "user", "content": prompt}
      ]
    )

    #insert_question_to_database(question, completion.choices[0].message.content)
    
    return {"message": completion.choices[0].message.content}