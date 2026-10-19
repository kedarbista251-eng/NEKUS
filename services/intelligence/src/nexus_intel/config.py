from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    service_name: str = "nexus-intelligence"
    port: int = 8000
    environment: str = Field(default="development", validation_alias="NODE_ENV")
    api_key: str = Field(default="internal-intel-key", validation_alias="INTELLIGENCE_SERVICE_API_KEY")

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

settings = Settings()
