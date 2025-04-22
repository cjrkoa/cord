import pandas as pd
import spacy
import numpy as np
import contractions
import datetime
import matplotlib.pyplot as plt
from mpl_toolkits.mplot3d import Axes3D
from scipy.interpolate import splprep, splev
from mpl_toolkits.mplot3d.art3d import Line3DCollection
from matplotlib.colors import Normalize, LinearSegmentedColormap
from matplotlib.cm import get_cmap

vad_trust_lexicon = pd.read_csv("nrc-vad-trust-lexicon.csv")
vad_trust_dict = vad_trust_lexicon.set_index("word").to_dict(orient="index")

trust = vad_trust_lexicon.drop(["valence", "arousal", "dominance"], axis=1)
trust_dict = trust.set_index("word").to_dict(orient="index")

vad_lexicon = vad_trust_lexicon.drop(["trust"], axis=1)
vad_dict = vad_lexicon.set_index("word").to_dict(orient="index")

# Define intensity modifiers with scaling factors
intensity_modifiers = {
    "extremely": 1.5,
    "immensely": 1.5,
    "exceptionally": 1.2, 
    "very": 1.15, 
    "really": 1.15, 
    "totally": 1.2,
    "especially": 1.1,
    "so": 1.3,
    "quite": 2.1,
    "pretty": 1.05,
    "mostly": 0.95,
    "slightly": 0.85, 
    "somewhat": 0.85, 
    "little": 0.75, 
    "barely": 0.7,
    "almost": 0.65,
    "!": 1.05,
}

nlp = spacy.load("en_core_web_sm")

def calculate_word_weights(sentence_scores: dict, weight_distribution: str = "uniform"):
    """Calculate emotional weight for sentence affect calculation.
    Weight is distributed with U shape. Words closer to 0 and 1 receive weight scores closer to 1,
    while words with scores closer to 0.5 receive weight scores closer to 0."""

    weights = {}
    if weight_distribution == "uniform":
        for word in sentence_scores:
            weights[word] = {}
            for key in sentence_scores[word]:
                weights[word][key] = 1 / len(sentence_scores)
        return weights
    elif weight_distribution == "quadratic":
        for word in sentence_scores:
            weights[word] = {}
            for key in sentence_scores[word]:
                weights[word][key] = (4 * (sentence_scores[word][key] - 0.5) ** 2) + 0.01

        all_weights = pd.DataFrame(weights)
        total_weights = all_weights.sum(axis=1)
        all_weights = all_weights.div(total_weights, axis=0)

        return all_weights
    elif weight_distribution == "linear":
        for word in sentence_scores:
            weights[word] = {}
            for key in sentence_scores[word]:
                weights[word][key] = sentence_scores[word][key] + 0.01

        all_weights = pd.DataFrame(weights)
        total_weights = all_weights.sum(axis=1)
        all_weights = all_weights.div(total_weights, axis=0)

        return all_weights
    else:
        raise ValueError("Invalid weight distribution type")

def compute_sentence_scores(sentence: str, lexicon: dict, factor_exclamation: bool = True, weight_distribution: str = "uniform"):
    """Process and calculate affect scores for sentences"""
    doc = nlp(contractions.fix(sentence.lower()))
    negated_words = []
    intensified_words = {}

    for token in doc:
        # looking for negated words
        if token.dep_ == "neg":
            head = token.head
            negated_words.append(token.head.text)

            for child in head.children:
                if child.dep_ in {"acomp", "attr", "dobj"}:  # Adjective, object, or attribute
                    negated_words.append(child.text)
            else:
                negated_words.append(head.text)
    
    for token in doc:
        # looking for intensified words
        if token.pos_ == 'ADV' and token.text in intensity_modifiers and token.dep_ == 'advmod' and (token.head.pos_ == 'ADJ' or token.head.pos_ == 'VERB'):
            intensified_words[token.head.text] = intensity_modifiers[token.text]

    negated_words = set(negated_words)

    exclamation_count = len([token.text for token in doc if token.text == "!"])
    tokens = [token.text for token in doc if not (token.is_punct or token.is_stop)]
   
    scores = {}
    for token in tokens:
        if token in lexicon:
            if token in negated_words:
                negated = {key: 1-value for key, value in lexicon[token].items()}
                scores[token] = negated
            else: scores[token] = lexicon[token]

    if len(scores) == 0:
        # accouting for the rare edge case a sentence contains meaningful tokens but none in lexicon
        scores = {"dummyword": {"valence": 0.5, "arousal": 0.5, "dominance": 0.5}}

    word_weights = calculate_word_weights(scores, weight_distribution)

    output = {}
    for word in scores:
        if word in intensified_words:
            for key in scores[word]:
                scores[word][key] *= intensified_words[word]
        for key in scores[word]:
            if key in output:
                output[key] += (scores[word][key] * word_weights[word][key])
            else: output[key] = (scores[word][key] * word_weights[word][key])

    output = {key: np.clip(value, -1, 1) for key, value in output.items()}

    if factor_exclamation and exclamation_count > 0:
        output["valence"] = np.clip(output["valence"] * (intensity_modifiers["!"] * exclamation_count), -1, 1)
        output["arousal"] = np.clip(output["arousal"] * (intensity_modifiers["!"] * exclamation_count), -1, 1)
        output["dominance"] = np.clip(output["dominance"] / (intensity_modifiers["!"] * exclamation_count), -1, 1)

    return output

def compute_trust_score(sentence: str, num_prior_meaningful_messages: int, lexicon: dict, mere_exposure_weight: float = 0.26):
    """Compute trust score with additional context factors beyond the content of the sentence
    The number of prior messages is factored in due to mere exposure effect/propinquity effect"""
    return np.clip(compute_sentence_scores(sentence, lexicon, factor_exclamation=False, weight_distribution="linear")["trust"] + (mere_exposure_weight * (num_prior_meaningful_messages / 150)), 0, 1)

def is_meaningful(sentence: str):
    doc = nlp(contractions.fix(sentence.lower()))
    
    if len(doc) < 15:
        return False
    
    tokens = [token.text for token in doc if not (token.is_punct or token.is_stop)]

    if len(tokens) == 0:
        return False

    return True

def score_to_string(data: dict) -> str:
    """Converts affect json metadata into string format for database storage and adds timestamp
    format: {valence}/{arousal}/{dominance}/{trust}/{year-month-day}/{time}"""

    return str(data["valence"])+"/"+str(data["arousal"])+"/"+str(data["dominance"])+"/"+str(data["trust"])+"/"+str(datetime.datetime.now()).replace(" ", "/")

def string_to_score(data: str) -> dict:
    """Reverts affect data string to dictionary"""
    destructured = data.split("/")
    
    return {
        "valence": float(destructured[0]),
        "arousal": float(destructured[1]),
        "dominance": float(destructured[2]),
        "trust": float(destructured[3]),
        "date": destructured[4],
        "time": destructured[5],
    }

def visualize_affect(data: list[dict], keys_to_plot: list[str] = ["valence", "arousal", "time"]):
    """Visualize affect trajectory as a smooth 3D curve over time"""

    if not data:
        print("No data to visualize.")
        return

    # Sort data by datetime
    #try:
    #    data.sort(key=lambda d: datetime.strptime(f"{d['date']} {d['time']}", "%Y-%m-%d %H:%M:%S:%f"))
    #except Exception as e:
    #    print("Date/time parsing error:", e)
    #    return

    # Filter invalid entries
    cleaned = [
        d for d in data
        if (all(k in d for k in (keys_to_plot[0], keys_to_plot[1], keys_to_plot[2])) and
           all(isinstance(d[k], (int, float)) and np.isfinite(d[k]) for k in (keys_to_plot[0], keys_to_plot[1], keys_to_plot[2])))
           or (keys_to_plot[2] == "time" 
               and all(k in d for k in (keys_to_plot[0], keys_to_plot[1])) 
               and all(isinstance(d[k], (int, float)) and np.isfinite(d[k]) for k in (keys_to_plot[0], keys_to_plot[1])))
    ]

    if len(cleaned) < 4:
        print("Need at least 4 valid points to fit a smooth curve.")
        return

    x = [d[keys_to_plot[0]] for d in cleaned]
    y = [d[keys_to_plot[1]] for d in cleaned]
    z = []

    if keys_to_plot[2] == "time":
        z = list(range(0, len(cleaned)))
    else:
        z = [d[keys_to_plot[2]] for d in cleaned]

    coords = list(zip(x, y, z))

    if len(coords) < 4:
        print("Too many duplicate points. Need at least 4 unique points.")
        return

    x, y, z = zip(*coords)

    try:
        k = min(3, len(x) - 1)
        tck, u = splprep([x, y, z], s=0.5, k=k)
        u_fine = np.linspace(0, 1, 200)
        v_fine, a_fine, d_fine = splev(u_fine, tck)
    except Exception as e:
        print("Curve fitting failed:", e)
        return

    # Plot
    fig = plt.figure()
    ax = fig.add_subplot(projection='3d')
    ax.scatter(x, y, z, color="#aa2bff", edgecolor="#ff2bfc", label='Affect points', s=100)
    #ax.plot(v_fine, a_fine, d_fine, color='orange', label='Affect trend curve', linewidth=3)

    # Prepare segments between points
    points = np.array([v_fine, a_fine, d_fine]).T.reshape(-1, 1, 3)
    segments = np.concatenate([points[:-1], points[1:]], axis=1)

    colors = ["#fc0303", "#fc6f03", "#fca103", "#fceb03"]
    cmap = LinearSegmentedColormap.from_list("my_gradient", colors)
    norm = Normalize(vmin=0, vmax=len(segments))
    colors = [cmap(norm(i)) for i in range(len(segments))]

    # Create line segments with those colors
    lc = Line3DCollection(segments, colors=colors, linewidth=3)
    ax.add_collection3d(lc)

    ax.grid(True, linestyle='--', alpha=0.3)
    ax.set_frame_on(False)
    ax.xaxis._axinfo["grid"]['color'] = (0.2, 0.2, 0.2, 0.2)
    ax.yaxis._axinfo["grid"]['color'] = (0.2, 0.2, 0.2, 0.2)
    ax.zaxis._axinfo["grid"]['color'] = (0.2, 0.2, 0.2, 0.2)

    ax.tick_params(colors='white')
    ax.set_xlabel(keys_to_plot[0].capitalize(), color="white")
    ax.set_ylabel(keys_to_plot[1].capitalize(), color="white")
    ax.set_zlabel(keys_to_plot[2].capitalize(), color="white")
    ax.set_title("Affect Over Time", color="white", fontsize=16, fontweight="bold")
    plt.style.use('dark_background')
    fig.patch.set_facecolor('#222') # Optional: custom dark background
    ax.set_facecolor('#222') 
    ax.legend()
    plt.tight_layout()
    plt.show()

if __name__ == "__main__":
    affect_raw = [
        "0.4847747604677819/0.5520699115506564/0.6520588232550139/0.8031939924906133/2025-04-06/16:16:16.891821",
        "0.23189843564938079/0.45964117852063274/0.5440998755327575/0.0017333333333333335/2025-04-06/16:18:50.317686",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.7713008635578583/2025-04-06/16:37:14.001749",
        "0.63442653254825/0.3416125143373222/0.2562185654381641/0.005200000000000001/2025-04-07/10:43:19.116857",
        "0.7577915174628838/0.4536808660703505/0.5944505332000333/0.8556713080168776/2025-04-07/10:45:20.147351",
        "0.8213974347076436/0.41818465815383576/0.6409548797933435/0.6258660166124955/2025-04-07/10:50:28.376125",
        "0.8946096197489098/0.5759695547725816/0.7099781590247917/0.010400000000000001/2025-04-07/11:33:31.234763",
        "0.6549910034011995/0.5998361884257127/0.7056857163439026/0.5631249087335018/2025-04-07/11:51:55.603792",
        "0.624941897592126/0.7294763694096914/0.7360529062470844/0.5416719911259014/2025-04-07/11:54:53.483031",
        "0.7769552277657267/0.5057063996091842/0.7617890378888298/0.0156/2025-04-07/11:58:18.067511",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.785167530224525/2025-04-07/12:03:36.938687",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.7869008635578584/2025-04-07/12:05:14.125971",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.7886341968911917/2025-04-07/17:03:02.102993",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.790367530224525/2025-04-07/17:04:21.974647",
        "0.5030124337143141/0.6526941434643455/0.5782952680302325/0.5206432282371605/2025-04-09/18:29:57.810348",
        "0.4230324026801591/0.40974445665272563/0.4025845592644413/0.5594456094364352/2025-04-10/02:49:27.175245",
        "0.8265638047667742/0.48245799637066566/0.5666559699653405/0.6069422106179286/2025-04-10/12:26:31.260928",
        "0.8265638047667742/0.48245799637066566/0.5666559699653405/0.6069422106179286/2025-04-10/12:26:31.260928",  
        "0.4230324026801591/0.40974445665272563/0.4025845592644413/0.5594456094364352/2025-04-10/02:49:27.175245",   
        "0.5030124337143141/0.6526941434643455/0.5782952680302325/0.5206432282371605/2025-04-09/18:29:57.810348",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.790367530224525/2025-04-07/17:04:21.974647",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.7886341968911917/2025-04-07/17:03:02.102993",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.7869008635578584/2025-04-07/12:05:14.125971",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.785167530224525/2025-04-07/12:03:36.938687",
        "0.7769552277657267/0.5057063996091842/0.7617890378888298/0.0156/2025-04-07/11:58:18.067511",
        "0.624941897592126/0.7294763694096914/0.7360529062470844/0.5416719911259014/2025-04-07/11:54:53.483031",
        "0.6549910034011995/0.5998361884257127/0.7056857163439026/0.5631249087335018/2025-04-07/11:51:55.603792",
        "0.8946096197489098/0.5759695547725816/0.7099781590247917/0.010400000000000001/2025-04-07/11:33:31.234763",
        "0.8213974347076436/0.41818465815383576/0.6409548797933435/0.6258660166124955/2025-04-07/10:50:28.376125",
        "0.7577915174628838/0.4536808660703505/0.5944505332000333/0.8556713080168776/2025-04-07/10:45:20.147351",
        "0.63442653254825/0.3416125143373222/0.2562185654381641/0.005200000000000001/2025-04-07/10:43:19.116857",
        "0.49028242751655976/0.6261453590804144/0.5093267069685006/0.7713008635578583/2025-04-06/16:37:14.001749",
        "0.23189843564938079/0.45964117852063274/0.5440998755327575/0.0017333333333333335/2025-04-06/16:18:50.317686",
        "0.4847747604677819/0.5520699115506564/0.6520588232550139/0.8031939924906133/2025-04-06/16:16:16.891821",
    ]
    #df = pd.read_csv("emotion-dataset-stacked.csv")
    #df["text"] = df["text"].astype(str)  # Ensure it's string type
    #df = df[df["text"].apply(is_meaningful)]
    #bigdata = []
    #for sentence in df["text"]:
    #    if is_meaningful(sentence):
    #        bigdata.append(compute_sentence_scores(sentence, vad_dict, weight_distribution="quadratic"))
    ##bigdata = [d for d in bigdata if d != {}]
    data = [string_to_score(value) for value in affect_raw]
    visualize_affect(data)