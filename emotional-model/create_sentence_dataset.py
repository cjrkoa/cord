import spacy
import pandas as pd
import numpy as np
from compute_sentence_score import compute_sentence_scores, lexicon_dict

if __name__ == "__main__":
    df = pd.read_csv("emotion-emotion_69k.csv")
    df = df.drop(["Unnamed: 0", "Unnamed: 5", "Unnamed: 6", "Situation", "emotion"], axis=1)
    df = df.map(lambda x: x.replace('\n', '') if isinstance(x, str) else x)

    prompts = df["prompt"]
    responses = df["response"]

    for sentence in prompts:
        print(f"Sentence: {sentence}")
        compute_sentence_scores(sentence, lexicon_dict)

    prompt_results = []

    for sentence in prompts:
        sentence_scores = compute_sentence_scores(sentence, lexicon_dict)
        prompt_results.append(sentence_scores)

    # Convert the list of dictionaries into a DataFrame
    score_prompt_df = pd.DataFrame(prompt_results)

    # Concatenate the score DataFrame with the original DataFrame
    df = pd.concat([df, score_prompt_df], axis=1)
    df = df.drop(["response"], axis=1)
    df["response"] = responses

    response_results = []

    for sentence in responses:
        sentence_scores = compute_sentence_scores(sentence, lexicon_dict)
        response_results.append(sentence_scores)

    score_response_df = pd.DataFrame(response_results)

    df = pd.concat([df, score_response_df], axis=1)

    # Print the DataFrame with added sentiment scores
    print(df.head())
    df.to_csv("emotion-dataset.csv", index=False)



