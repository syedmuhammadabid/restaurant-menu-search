import json

from qdrant_client import QdrantClient
from qdrant_client.models import Distance, PointStruct, VectorParams
from sentence_transformers import SentenceTransformer

from app.config import settings


def load_menu(path: str) -> list[dict]:
    with open(path) as f:
        return json.load(f)


def build_text(item: dict) -> str:
    parts = [item["name"]]
    parts.append(f"Category: {item['category']}")
    if item.get("size"):
        parts.append(f"Size: {item['size']}")
    if item.get("items"):
        parts.append("Includes: " + ", ".join(item["items"]))
    if item.get("tags"):
        parts.append("Tags: " + ", ".join(item["tags"]))
    return ". ".join(parts)


def ingest():
    client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
    model = SentenceTransformer(settings.embedding_model)
    items = load_menu(settings.menu_path)

    client.recreate_collection(
        collection_name=settings.collection_name,
        vectors_config=VectorParams(
            size=settings.embedding_dim,
            distance=Distance.COSINE,
        ),
    )

    texts = [build_text(item) for item in items]
    embeddings = model.encode(texts)

    points = [
        PointStruct(
            id=item["id"],
            vector=embedding.tolist(),
            payload={
                "name": item["name"],
                "category": item["category"],
                "price": item.get("price"),
                "size": item.get("size"),
                "tags": item.get("tags", []),
                "items": item.get("items"),
            },
        )
        for item, embedding in zip(items, embeddings)
    ]

    client.upsert(collection_name=settings.collection_name, points=points)
    print(f"Ingested {len(points)} menu items into '{settings.collection_name}'")
