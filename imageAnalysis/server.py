from sentence_transformers import SentenceTransformer, util
from PIL import Image
import os
from flask import Flask, request
import re
from io import BytesIO
import base64
from flask_cors import CORS
from torch import Tensor
from dataclasses import dataclass
from pprint import pprint

@dataclass
class TargetImageInput:
    id: str
    extension: str

@dataclass
class Similarity:
    id: str
    score: float

def generate_embedding(model: SentenceTransformer, dataUrl: str, targets: list[TargetImageInput]):
    paths = []

    # add the source image
    paths.append(BytesIO(base64.b64decode(re.sub('^data:image/.+;base64,', '', dataUrl))))

    # add the target images
    base = os.path.dirname(__file__)
    for t in targets:
        p = os.path.join(base, '..', '.vite-storage', 'DATA', 'photo-cards', f'{t.id}.{t.extension}')
        paths.append(p)

    pprint(paths)
    return model.encode([Image.open(filepath) for filepath in paths], batch_size=128, convert_to_tensor=True, show_progress_bar=True)


def get_similarity(embedding: list[Tensor], targets: list[TargetImageInput]):
    processed_images = util.paraphrase_mining_embeddings(embedding)

    output: list[Similarity] = []

    for score, image_id1, image_id2 in processed_images:
        if image_id1 != 0:
            continue
        id = targets[int(image_id2 - 1)].id

        output.append(Similarity(id, score))

    return output

# Load the OpenAI CLIP Model
print('Loading CLIP Model...')
model = SentenceTransformer('clip-ViT-B-32')

# Start flask
app = Flask(__name__)
CORS(app)

@app.route("/compare", methods=['POST'])
def hello_world():
    data = request.get_json()
    
    targets = [TargetImageInput(x["id"], x["extension"]) for x in data["targets"]]
    embedding = generate_embedding(model, data["image"], targets)

    return get_similarity(embedding, targets)

