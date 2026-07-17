from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.search import list_categories, search_menu

app = FastAPI(title="Cafe Bagalo Menu Search", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=False,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/categories")
def categories():
    items = list_categories()
    return {"count": len(items), "categories": items}


@app.get("/search")
def search(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(5, ge=1, le=50),
    category: str | None = Query(None, description="Filter by category"),
    min_price: float | None = Query(None, ge=0),
    max_price: float | None = Query(None, ge=0),
):
    results = search_menu(
        query=q,
        limit=limit,
        category=category,
        min_price=min_price,
        max_price=max_price,
    )
    return {"query": q, "count": len(results), "results": results}
