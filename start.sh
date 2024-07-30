#!/bin/bash

mkdir ./scripts

# Create a temporary script to run in the new terminal
cat <<EOF > ./scripts/print_message.sh
#!/bin/bash
echo "Hello from the new terminal!"
exec bash  # Keep the terminal open
EOF

# Create a temporary script to run in the new terminal
cat <<EOF > ./scripts/start_client.sh
#!/bin/bash
cd client
npx expo start
i
echo "Client Started!"
exec bash  # Keep the terminal open
EOF

# Create a temporary script to run in the new terminal
cat <<EOF > ./scripts/start_server.sh
#!/bin/bash
cd server
source venv/bin/activate
flask --app server run
echo "Flask Server Started!"
exec bash  # Keep the terminal open
EOF

# Create a temporary script to run in the new terminal
cat <<EOF > ./scripts/start_chatbot.sh
#!/bin/bash
cd server
cd chatbot
source venv/bin/activate
rasa run --enable_api
echo "Rasa Server Started!"
exec bash  # Keep the terminal open
EOF

# Make the temporary script executable
chmod +x ./scripts/print_message.sh
chmod +x ./scripts/start_client.sh
chmod +x ./scripts/start_server.sh
chmod +x ./scripts/start_chatbot.sh

# Open a new Terminal window and run the temporary script
open -a Terminal ./scripts/print_message.sh
open -a Terminal ./scripts/start_client.sh
open -a Terminal ./scripts/start_server.sh
open -a Terminal ./scripts/start_chatbot.sh