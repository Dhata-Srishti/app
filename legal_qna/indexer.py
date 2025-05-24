import json
from sentence_transformers import SentenceTransformer
import faiss

MODEL_NAME = 'all-MiniLM-L6-v2'

def chunk_text(text: str, max_words: int = 100):
    words = text.split()
    for i in range(0, len(words), max_words):
        yield " ".join(words[i:i+max_words])


def build_index(full_text: str, out_dir: str = 'data'):
    model = SentenceTransformer(MODEL_NAME)
    chunks = list(chunk_text(full_text))
    embeddings = model.encode(chunks, convert_to_numpy=True)

    # save chunks
    with open(f'{out_dir}/chunks.json', 'w') as f:
        json.dump(chunks, f)

    # build FAISS index
    dim = embeddings.shape[1]
    index = faiss.IndexFlatL2(dim)
    index.add(embeddings)
    faiss.write_index(index, f'{out_dir}/index.faiss')
    return chunks


def load_index(out_dir: str = 'data'):
    model = SentenceTransformer(MODEL_NAME)
    index = faiss.read_index(f'{out_dir}/index.faiss')
    with open(f'{out_dir}/chunks.json') as f:
        chunks = json.load(f)
    return model, index, chunks 