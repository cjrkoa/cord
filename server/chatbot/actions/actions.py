# This files contains your custom actions which can be used to run
# custom Python code.
#
# See this guide on how to implement these action:
# https://rasa.com/docs/rasa/custom-actions


# This is a simple example for a custom action which utters "Hello World!"

from typing import Any, Text, Dict, List

from rasa_sdk import Action, Tracker
from rasa_sdk.executor import CollectingDispatcher

from database import get_database

db = get_database()

class ActionHelloWorld(Action):

    def name(self) -> Text:
        return "action_hello_world"

    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: Dict[Text, Any]) -> List[Dict[Text, Any]]:

        dispatcher.utter_message(text="Hello World!")

        return []
    
class ActionCheckUserStatus(Action):
    def name(self) -> str:
        return "action_check_user_status"
    
    def run(self, dispatcher: CollectingDispatcher,
            tracker: Tracker,
            domain: dict) -> List[Dict[Text, Any]]:
        
        username = tracker.sender_id
        user = db["users"].find_one({"username": username})

        if user["lastInteraction"] == None:
            return True
        else:
            return False
        
