import pandas as pd

splits = {'train': 'data/train-00000-of-00001-9564e8b05b4757ab.parquet', 'test': 'data/test-00000-of-00001-701d16158af87368.parquet'}
df = pd.read_parquet("hf://datasets/deepset/prompt-injections/" + splits["train"])

# prompt: I want to take df and create a classifier model

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import accuracy_score

# Assuming 'df' is already loaded as in the previous code
# and contains columns relevant for classification, e.g., 'text' and 'label'

# Preprocess text data (example, you may need more sophisticated preprocessing)
df['text'] = df['text'].astype(str)

# Split data into training and validation sets
X_train, X_val, y_train, y_val = train_test_split(df['text'], df['label'], test_size=0.2, random_state=42)

# Feature extraction using TF-IDF
vectorizer = TfidfVectorizer(max_features=5000)  # Adjust max_features as needed
X_train_vec = vectorizer.fit_transform(X_train)
X_val_vec = vectorizer.transform(X_val)

# Train a Logistic Regression classifier (example, try other models)
classifier = RandomForestClassifier(
    n_estimators=100,  
    criterion='gini', 
    max_depth=None, 
    min_samples_split=2, 
    min_samples_leaf=1, 
    min_weight_fraction_leaf=0.0, 
    max_features='sqrt', 
    max_leaf_nodes=None, 
    min_impurity_decrease=0.0, 
    bootstrap=True, 
    oob_score=False, 
    n_jobs=None, 
    random_state=None, 
    verbose=0, 
    warm_start=False, 
    class_weight=None, 
    ccp_alpha=0.0, 
    max_samples=None, 
  )

classifier.fit(X_train_vec, y_train)

# Make predictions
y_pred = classifier.predict(X_val_vec)

# Evaluate the model
accuracy = accuracy_score(y_val, y_pred)
print(f"Accuracy: {accuracy}")

import joblib

# Save the model
filename = 'vectorizer.joblib'
joblib.dump(vectorizer, filename)