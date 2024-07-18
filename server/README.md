# Basic Setup:

```bash
python 3.9 -m venv venv
```

# Terminal 1:

```bash
cd server
source venv/bin/activate
cd chatbot
rasa run --enable-api
```

# Terminal 2:

```bash
cd server
source venv/bin/activate
flask --app server run
```
