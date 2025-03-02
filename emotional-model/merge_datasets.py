import pandas as pd


emotion_intensity = pd.read_csv("nrc-emotion-intensity.csv", usecols=[0,1,2,3,4,5,6,7,8])

vad_lexicon = pd.read_csv("nrc-vad-lexicon.csv")  # Replace with actual file path
merged_df = pd.merge(emotion_intensity, vad_lexicon, on="English Word", how="outer")
merged_df.to_csv("nrc-merged-lexicon.csv", index=False)

print(merged_df.head())
merged_df.fillna(0, inplace=True)  # Replace NaN with 0
merged_df.dropna(inplace=True)  # Remove rows with NaN
