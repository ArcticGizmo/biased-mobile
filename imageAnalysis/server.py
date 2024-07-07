from sentence_transformers import SentenceTransformer, util
from PIL import Image
import glob
import os
from flask import Flask, request
import re
from io import BytesIO
import base64
from flask_cors import CORS
import json
from torch import Tensor
from dataclasses import dataclass
from pprint import pprint

@dataclass
class TargetImageInput:
    id: str
    extension: str

@dataclass
class TargetImage:
    id: str
    image: Tensor


def compare(model, test_image):

    # Next we compute the embeddings
    # To encode an image, you can use the following code:
    # from PIL import Image
    # encoded_image = model.encode(Image.open(filepath))
    # image_names = list(glob.glob('../.vite-storage/DATA/photo-cards/*.png'))
    image_names = [test_image, test_image]
    # print("Images:", len(image_names))
    encoded_image = model.encode([Image.open(filepath) for filepath in image_names], batch_size=128, convert_to_tensor=True, show_progress_bar=True)

    # Now we run the clustering algorithm. This function compares images aganist 
    # all other images and returns a list with the pairs that have the highest 
    # cosine similarity score
    processed_images = util.paraphrase_mining_embeddings(encoded_image)
    NUM_SIMILAR_IMAGES = 10 

    # =================
    # DUPLICATES
    # =================
    print('Finding duplicate images...')
    # Filter list for duplicates. Results are triplets (score, image_id1, image_id2) and is scorted in decreasing order
    # A duplicate image will have a score of 1.00
    # It may be 0.9999 due to lossy image compression (.jpg)
    duplicates = [image for image in processed_images if image[0] >= 0.999]

    # Output the top X duplicate images
    for score, image_id1, image_id2 in duplicates[0:NUM_SIMILAR_IMAGES]:
        print("\nScore: {:.3f}%".format(score * 100))
        print(image_names[image_id1])
        print(image_names[image_id2])

    # =================
    # NEAR DUPLICATES
    # =================
    print('Finding near duplicate images...')
    # Use a threshold parameter to identify two images as similar. By setting the threshold lower, 
    # you will get larger clusters which have less similar images in it. Threshold 0 - 1.00
    # A threshold of 1.00 means the two images are exactly the same. Since we are finding near 
    # duplicate images, we can set it at 0.99 or any number 0 < X < 1.00.
    threshold = 0.99
    near_duplicates = [image for image in processed_images if image[0] < threshold]

    for score, image_id1, image_id2 in near_duplicates[0:NUM_SIMILAR_IMAGES]:
        print("\nScore: {:.3f}%".format(score * 100))
        print(image_names[image_id1])
        print(image_names[image_id2])

def generate_embedding(model: SentenceTransformer, dataUrl: str, targets: list[TargetImageInput]):
    paths = []

    # add the source image
    paths.append(BytesIO(base64.b64decode(re.sub('^data:image/.+;base64,', '', dataUrl))))

    # add the target images
    base = os.path.dirname(__file__)
    for t in targets:
        p = os.path.join(base, '..', '.vite-storage', 'DATA', 'photo-cards', f'{t.id}.{t.extension}')
        paths.append(p)

    return model.encode([Image.open(filepath) for filepath in paths], batch_size=128, convert_to_tensor=True, show_progress_bar=True)


# def load_source_image(model: SentenceTransformer, dataUrl: str):
#     data = BytesIO(base64.b64decode(re.sub('^data:image/.+;base64,', '', dataUrl)))
#     return model.encode([Image.open(data)], batch_size=128, convert_to_tensor=True, show_progress_bar=True)[0]

# def load_targets(model: SentenceTransformer, targets: list[TargetImageInput]):
#     # load all the images
#     base = os.path.dirname(__file__)
#     paths = [os.path.join(base, '..', '.vite-storage', 'DATA', 'photo-cards', f'{t.id}.{t.extension}') for t in targets]
#     images = model.encode([Image.open(filepath) for filepath in paths], batch_size=128, convert_to_tensor=True, show_progress_bar=True)
    
#     # compose into dataclasses
#     return [TargetImage(targets[i].id, images[i]) for i in range(len(targets))]

def get_similarity(model: SentenceTransformer, embedding: list[Tensor]):
    processed_images = util.paraphrase_mining_embeddings(embedding)

    pprint(processed_images)

# Load the OpenAI CLIP Model
print('Loading CLIP Model...')
model = SentenceTransformer('clip-ViT-B-32')
# model = 7


app = Flask(__name__)
CORS(app)

@app.route("/compare", methods=['POST'])
def hello_world():
    data = request.get_json()
    # print(json.dumps(data, sort_keys=True, indent=4))
    

    source = load_source_image(model, data["image"])

    inputTargets = [TargetImageInput(x["id"], x["extension"]) for x in data["targets"]]

    targets = load_targets(model, inputTargets)

    output: dict[str, float] = {}

    for t in targets:
        similarity = get_similarity(model, source, t)
        output[t.id] = similarity

    # print(json.dumps(data, sort_keys=True, indent=4))
    # load_images(data["ids"])
    # image = data["image"]
    # imageWithoutEncoding = BytesIO(base64.b64decode(re.sub('^data:image/.+;base64,', '', image)))
    # compare(model, imageWithoutEncoding)
    return "<p>Hello, World!</p>"

