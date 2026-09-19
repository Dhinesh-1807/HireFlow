import json
import logging
from typing import Dict, Any, Optional
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger("hireflow.llm")


class LLMService:
    def __init__(self):
        self._client: Optional[OpenAI] = None
        if settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your_") and not settings.OPENAI_API_KEY.startswith("mock-"):
            try:
                self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI client: {e}")

    @property
    def client(self) -> Optional[OpenAI]:
        # Lazily instantiate if API key was updated in environment/settings
        if self._client is None and settings.OPENAI_API_KEY and not settings.OPENAI_API_KEY.startswith("your_") and not settings.OPENAI_API_KEY.startswith("mock-"):
            try:
                self._client = OpenAI(api_key=settings.OPENAI_API_KEY)
            except Exception as e:
                logger.warning(f"Could not initialize OpenAI client: {e}")
        return self._client

    def has_active_key(self) -> bool:
        return self.client is not None

    def generate_json(self, system_prompt: str, user_prompt: str, fallback_generator=None) -> Dict[str, Any]:
        """
        Send a prompt to OpenAI requiring a JSON object response.
        If OpenAI API key is missing or call fails, falls back gracefully.
        """
        if self.has_active_key():
            try:
                response = self.client.chat.completions.create(
                    model=settings.OPENAI_MODEL,
                    messages=[
                        {"role": "system", "content": system_prompt},
                        {"role": "user", "content": user_prompt},
                    ],
                    response_format={"type": "json_object"},
                    temperature=0.2,
                )
                content = response.choices[0].message.content
                return json.loads(content)
            except Exception as e:
                logger.error(f"OpenAI API call failed: {e}. Utilizing fallback response handler.")
                if fallback_generator:
                    return fallback_generator()
                raise e

        # Offline / Demo Fallback Mode
        logger.info("Operating in LLM fallback / demo mode (no live OpenAI key configured).")
        if fallback_generator:
            return fallback_generator()

        return {"error": "OpenAI API key not configured. Please set OPENAI_API_KEY in .env"}


llm_service = LLMService()
