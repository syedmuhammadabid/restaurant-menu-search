from pydantic_settings import BaseSettings
from qdrant_client import QdrantClient


class Settings(BaseSettings):
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    qdrant_url: str | None = None
    qdrant_api_key: str | None = None
    collection_name: str = "menu_items"
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dim: int = 384
    menu_path: str = "data/menu.json"

    model_config = {"env_prefix": "APP_", "env_file": ".env", "env_file_encoding": "utf-8"}

    def get_qdrant_client(self) -> QdrantClient:
        if self.qdrant_url:
            return QdrantClient(
                url=self.qdrant_url,
                api_key=self.qdrant_api_key,
                prefer_grpc=False,
            )
        return QdrantClient(
            host=self.qdrant_host,
            port=self.qdrant_port,
            prefer_grpc=False,
        )


settings = Settings()
