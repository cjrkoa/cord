#!/bin/bash
cd server
cd chatbot
source venv/bin/activate
rasa run --enable_api
echo "Rasa Server Started!"
exec bash  # Keep the terminal open
