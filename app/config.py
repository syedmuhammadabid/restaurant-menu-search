from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    qdrant_host: str = "localhost"
    qdrant_port: int = 6333
    collection_name: str = "menu_items"
    embedding_model: str = "all-MiniLM-L6-v2"
    embedding_dim: int = 384
    menu_path: str = "data/menu.json"

    model_config = {"env_prefix": "APP_"}


settings = Settings()
