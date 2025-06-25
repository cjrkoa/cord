# Set base image (host OS)
FROM python:3.9.20

# By default, listen on port 5000
EXPOSE 5000/tcp

# Set the working directory in the container
WORKDIR /server

# Copy the dependencies file to the working directory
COPY requirements.txt .

# Install any dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN python -m spacy download en_core_web_sm

# Copy the content of the local src directory to the working directory
COPY server.py .
COPY database.py .
COPY gpt_wrapper.py .
COPY .env .
COPY compute_sentence_score.py .
COPY nrc-vad-trust-lexicon.csv .
COPY prompt_injection_detection.joblib .
COPY vectorizer.joblib .

# Specify the command to run on container start
CMD [ "python", "./server.py" ]