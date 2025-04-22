import os

os.environ["HF_HOME"] = os.getcwd()+"/cache"

import requests
import json
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer
from gpt_wrapper import generate_response

tokenizer = AutoTokenizer.from_pretrained('gpt2')
model = AutoModelForCausalLM.from_pretrained('gpt2', torch_dtype=torch.float16)

corpus_of_documents = [
    "An emotion is a neurobiological phenomenon that explains or provides information about a person’s state of being, their relationship to another person, the outside world, signals a need, threat, or desire. Emotions are information. We’re not defined by our emotions, but rather what we do with them. It’s why self-awareness and reflection are so important. We experience emotions before becoming consciously aware that we’re feeling something. The limbic system sends signals to the motor cortex to act on and express emotional state before the prefrontal cortex (higher order cognitive processes, executive function, sense of self, etc.) is made signaled to become aware of this information. Paul Eckman, one of the founding fathers of affective (emotion) science names seven basic emotions we can infer from facial expressions: Happiness, sadness, anger, fear, disgust, surprise, and contempt. These emotions lay the foundation for higher order social emotions like pride, envy, jealousy, embaressment, and others. Exercises like mood journaling, talking with someone about your feelings, labeling how you’re feeling, and reading about emotion all help us build a healthy relationship with our emotions. Humans are emotional creatures. To feel is to be human. We all deserve a space to express our emotions without judgement because we’re human.",
    "Experiencing joy or happiness releases a flood of neurochemicals like dopamine, norepinephrine, and serotonin into the brain.",
    "Anxiety and anger both activate the amygdala (involved in emotional response and fight-or-flight), motor cortex (involved in movement), anterior cingulate cortex (involved in social behavior regulation and emotion), and the hypothalamus (hormone regulation) is signaled to release adrenaline into the body. Your heart rate skyrockets, pupils dilate, muscles tense, your blood vessels constrict, and your air passages expand — your body enters fight-or-flight.",
    "Anxiety is fear of the future, fear of uncertainty. It’s our body’s way of trying to protect us from a real or imagined threat. It can manifest as irritability, physical symptoms like heartache, high resting heart rate, insomnia, and fatigue.",
    "Stress is our body's way of signaling we have too much on our plate. Too many demands and not enough resources.",
    "We can think of envy as anger directed at someone for having something we don’t — envy signals desire. Jealousy is fear of loss, usually within the context of a close relationship. We often jealous when we perceive our partner is spending more time with someone other than us. There’s a certain connotation that comes with the words “envy” and “jealous”. It’s natural to experience these emotions, it’s the social brain working as intended. If you’ve ever felt envious of someone or experienced jealousy, congratulations, you’re human!",
    "Hyperarousal, or extended periods of heightened alertness, is a symptoms of mental health disorders like generalized anxiety disorder (GAD), post-traumatic stress disorder (PTSD), and sometimes even severe chronic stress.",
]

def jaccard_similarity(query, document):
    query = query.lower().split(" ")
    document = document.lower().split(" ")
    intersection = set(query).intersection(set(document))
    union = set(query).union(set(document))
    return len(intersection)/len(union)

def return_response(query, corpus):
    similarities = []
    for doc in corpus:
        similarity = jaccard_similarity(query, doc)
        similarities.append(similarity)
    return corpus_of_documents[similarities.index(max(similarities))]

def share_knowledge(query):
    relevant_document = return_response(query, corpus_of_documents)
    print(relevant_document)
    truncated_document = relevant_document[:900]
    
    sysprompt = f"""
    Document: {relevant_document}
    Summarize the most relevant idea from the following document based on the user's prompt briefly for casual knowledge sharing and trust building. Limit response to maximum of one sentence.
    """
    
    #if tokenizer.pad_token is None:
    #    tokenizer.pad_token = tokenizer.eos_token
    #
    #inputs = tokenizer(prompt, return_tensors='pt', padding=True, truncation=True)
    #attention_mask = inputs["attention_mask"]

    #outputs = model.generate(
    #    inputs["input_ids"], 
    #    do_sample = True,
    #    temperature = 0.7,
    #    max_new_tokens=60, 
    #    attention_mask=attention_mask,
    #    pad_token_id=tokenizer.eos_token_id
    #)
    #
    ## Decode and return the result
    #summary = tokenizer.batch_decode(outputs, skip_special_tokens=True)[0]

    #summary = summary.split("---DOCUMENT END---")[-1].strip()

    response = generate_response(memory=[], prompt=query, instructions=sysprompt)

    return response

# Main execution
if __name__ == "__main__":
    user_input = "I'm anxious"
    recommendation = share_knowledge(user_input)
    print(f"{recommendation}")

