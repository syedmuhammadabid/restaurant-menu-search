from qdrant_client import QdrantClient
from qdrant_client.models import Filter, FieldCondition, MatchValue
from sentence_transformers import SentenceTransformer

from app.config import settings

_client = QdrantClient(host=settings.qdrant_host, port=settings.qdrant_port)
_model = SentenceTransformer(settings.embedding_model)


def search_menu(
    query: str,
    limit: int = 5,
    category: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
) -> list[dict]:
    vector = _model.encode(query).tolist()

    conditions = []
    if category:
        conditions.append(
            FieldCondition(key="category", match=MatchValue(value=category))
        )

    query_filter = Filter(must=conditions) if conditions else None

    results = _client.query_points(
        collection_name=settings.collection_name,
        query=vector,
        query_filter=query_filter,
        limit=limit,
    ).points

    hits = []
    for point in results:
        payload = point.payload
        price = payload.get("price")

        if price is not None:
            if min_price is not None and price < min_price:
                continue
            if max_price is not None and price > max_price:
                continue
        elif min_price is not None or max_price is not None:
            continue

        hit = {
            "id": point.id,
            "score": point.score,
            "name": payload["name"],
            "category": payload["category"],
            "price": price,
            "tags": payload.get("tags", []),
        }
        if payload.get("size"):
            hit["size"] = payload["size"]
        if payload.get("items"):
            hit["items"] = payload["items"]

        hits.append(hit)

    return hits
