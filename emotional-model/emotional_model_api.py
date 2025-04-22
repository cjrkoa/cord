import os

os.environ["HF_HOME"] = os.getcwd()+"/cache"

import torch
import torch.nn as nn
from transformers import BertTokenizer, BertModel

# Example model architecture
class EmotionModel(nn.Module):
    def __init__(self, pretrained_model_name='bert-base-uncased', num_classes=11):  # 11 classes for each emotion/trait
        super(EmotionModel, self).__init__()
        self.bert = BertModel.from_pretrained(pretrained_model_name)
        self.fc = nn.Linear(self.bert.config.hidden_size, num_classes)  # Output layer for 11 emotions/traits

    def forward(self, input_ids, attention_mask=None, token_type_ids=None):
        outputs = self.bert(input_ids, attention_mask=attention_mask, token_type_ids=token_type_ids)
        cls_output = outputs.pooler_output
        return self.fc(cls_output)

def get_emotion_metadata(user_input: str):
    # Load the model
    model = EmotionModel()
    model.load_state_dict(torch.load('emotional-model.pt', map_location=torch.device("cpu")), strict=False)
    model.eval()  # Set model to evaluation mode

    # Load a tokenizer (assuming the model uses BERT-style embeddings)
    tokenizer = BertTokenizer.from_pretrained('bert-base-uncased')

    # Preprocess the input
    inputs = tokenizer(user_input, return_tensors='pt')

    # Assuming the model takes embeddings, not token IDs directly
    # If your model needs a [batch_size, 768] input, use the hidden states from a transformer model
    # Here, we'll just use the 'input_ids' as an example; adapt as needed
    with torch.no_grad():
        # Pass through the model
        output = model(**inputs)  # input_ids and attention_mask are passed as **inputs

        # Output processing: the output is expected to be a tensor of shape [batch_size, 11] for 11 intensity values
        intensity_values = output.squeeze().tolist()  # Convert to list for easier inspection

        # Define the label columns
        label_columns = [
            'anger', 'anticipation', 'disgust', 'fear', 'joy', 'sadness', 
            'surprise', 'trust', 'valence', 'arousal', 'dominance'
        ]

        if len(intensity_values) != len(label_columns):
            raise ValueError(f"Expected {len(label_columns)} intensity values, but got {len(intensity_values)}.")

        # Create a list of tuples (label, intensity_value)
        labeled_intensity = [(label, intensity) for label, intensity in zip(label_columns, intensity_values)]
        # Return the list of labeled intensity values
        return labeled_intensity
    
if __name__ == "__main__":
    print(get_emotion_metadata("I feel extremely happy"))




