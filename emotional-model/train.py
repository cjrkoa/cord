#!/usr/bin/env python3

import os

os.environ['HF_HOME'] = os.path.join(os.getcwd(), 'cache')

import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, Dataset
from transformers import BertModel, BertTokenizer
import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.preprocessing import MinMaxScaler
from scipy.stats import pearsonr

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

class EmotionBERT(nn.Module):
    def __init__(self, base_model='bert-base-uncased', num_labels=11):
        super(EmotionBERT, self).__init__()
        self.bert = BertModel.from_pretrained(base_model)
        self.dropout = nn.Dropout(0.3)  # Helps prevent overfitting
        self.classifier = nn.Linear(768, num_labels)  

    def forward(self, input_ids, attention_mask):
        outputs = self.bert(input_ids=input_ids, attention_mask=attention_mask)
        pooled_output = outputs.pooler_output  # CLS token representation
        pooled_output = self.dropout(pooled_output)
        logits = self.classifier(pooled_output)
        return logits

model_base = BertModel.from_pretrained('bert-base-uncased') # choose model
classifier = nn.Linear(768, 11) # classifier head - for single label, we use a dense layer. for multiple labels, we use one output for each class
model = EmotionBERT() # concatenate bert encoder and classifier into single model

model.to(device)

# define optimizer and loss function
criterion = nn.SmoothL1Loss()  
optimizer = optim.AdamW(model.parameters(), lr=2e-5)

data = pd.read_csv('emotion-dataset-stacked.csv') # load data
data = data.drop(["type"], axis=1)

scaler = MinMaxScaler()
data[["anger", "anticipation", "disgust", "fear", "joy", "sadness",
      "surprise", "trust", "valence", "arousal", "dominance"]] = scaler.fit_transform(
    data[["anger", "anticipation", "disgust", "fear", "joy", "sadness",
          "surprise", "trust", "valence", "arousal", "dominance"]])

train_data, test_data = train_test_split(data, test_size=0.2, random_state=42)

class TextDataset(Dataset):
    def __init__(self, dataframe, tokenizer, max_length=128):
        self.dataframe = dataframe
        self.tokenizer = tokenizer
        self.max_length = max_length

        # Assuming the first column is 'text' and the rest are emotion scores
        self.label_columns = [
            'anger', 'anticipation', 'disgust', 'fear', 'joy', 'sadness', 
            'surprise', 'trust', 'valence', 'arousal', 'dominance'
        ]

    def __len__(self):
        return len(self.dataframe)

    def __getitem__(self, index):
        # Get the word and the corresponding emotion labels
        text = self.dataframe.iloc[index]['text']  # The 'text' column for input
        labels = self.dataframe.iloc[index][self.label_columns].values.astype(float)  # Extract emotion labels

        # Tokenize the text
        encoding = self.tokenizer.encode_plus(
            text,
            add_special_tokens=True,
            max_length=self.max_length,
            padding='max_length',  # Pad to max_length
            truncation=True,  # Truncate if text is longer than max_length
            return_tensors='pt',  # Return pytorch tensors
        )

        # Return the tokenized input and emotion labels
        return {
            'input_ids': encoding['input_ids'].squeeze(0),  # Flatten to remove extra batch dimension
            'attention_mask': encoding['attention_mask'].squeeze(0),  # Flatten to remove extra batch dimension
            'labels': torch.tensor(labels, dtype=torch.float)  # Use float for regression targets
        }

tokenizer = BertTokenizer.from_pretrained('bert-base-uncased') # or BertTokenizer

train_dataset = TextDataset(train_data, tokenizer)
test_dataset = TextDataset(test_data, tokenizer)

# Create DataLoader objects from dataset to feed data into the model. We use a batch size of 16
train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True)
test_loader = DataLoader(test_dataset, batch_size=16)

# Training function
def train(model, optimizer, train_loader, criterion):
    model.train()
    total_loss = 0

    for batch in train_loader:
        optimizer.zero_grad()
        input_ids = batch['input_ids'].to(device)
        attention_mask = batch['attention_mask'].to(device)
        labels = batch['labels'].to(device)
        
        # Forward pass
        outputs = model(input_ids=input_ids, attention_mask=attention_mask)  
        #outputs = model(bert_outputs.pooler_output)
        
        # Calculate loss
        loss = criterion(outputs, labels) 
        loss.backward()
        optimizer.step()
        total_loss += loss.item()

    print(f'Training loss: {total_loss/len(train_loader)}')
    return total_loss/len(train_loader)

# Evaluation function
def evaluate(model, test_loader, criterion):
    model.eval()
    total_loss = 0
    all_labels = []
    all_preds = []

    with torch.no_grad():
        for batch in test_loader:
            input_ids = batch['input_ids'].to(device)
            attention_mask = batch['attention_mask'].to(device)
            labels = batch['labels'].to(device)
            
            # Forward pass
            outputs = model(input_ids=input_ids, attention_mask=attention_mask)  
            #outputs = model(bert_outputs.pooler_output)  # Apply classifier

            # Collect labels and predictions for metrics
            all_labels.append(labels.cpu().numpy())
            all_preds.append(outputs.cpu().numpy())
            
            # Calculate loss
            loss = criterion(outputs, labels)
            total_loss += loss.item()

    # Convert lists to numpy arrays
    all_labels = np.concatenate(all_labels, axis=0)
    all_preds = np.concatenate(all_preds, axis=0)
    
    # Compute evaluation metrics
    mse = mean_squared_error(all_labels, all_preds)
    mae = mean_absolute_error(all_labels, all_preds)
    rmse = np.sqrt(mse)
    r2 = r2_score(all_labels, all_preds)
    pearson_corr, _ = pearsonr(all_labels.flatten(), all_preds.flatten())

    print(f'Test loss: {total_loss/len(test_loader)}')
    print(f'Mean Squared Error (MSE): {mse}')
    print(f'Mean Absolute Error (MAE): {mae}')
    print(f'Root Mean Squared Error (RMSE): {rmse}')
    print(f'R-squared (R²): {r2}')
    print(f'Pearson Correlation: {pearson_corr}')

    # Return the predictions (for further use, e.g., saving results)
    # return all_preds
    return total_loss/len(test_loader)

best_loss = float('inf')
patience = 5  # Stop training if loss doesn't improve for 5 consecutive epochs
counter = 0

for epoch in range(75):
    train_loss = train(model, optimizer, train_loader, criterion)
    test_loss = evaluate(model, test_loader, criterion)

    if test_loss < best_loss:
        best_loss = test_loss
        torch.save(model.state_dict(), 'emotion-model.pt')
        counter = 0  # Reset counter if improvement
    else:
        counter += 1  # Increase counter if no improvement
        if counter >= patience:
            print("Early stopping triggered.")
            break  # Stop training

print("Best model saved.")



