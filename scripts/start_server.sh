#!/bin/bash
cd server
source venv/bin/activate
flask --app run server
echo "Flask Server Started!"
exec bash  # Keep the terminal open
