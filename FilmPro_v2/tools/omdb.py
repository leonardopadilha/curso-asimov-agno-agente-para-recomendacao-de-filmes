import os
import aiohttp
from typing import Any

async def search_movie(title: str) -> dict[str, Any] | str:
    api_key = os.getenv("OMDB_API_KEY")
    if not api_key:
        raise ValueError("OMDB_API_KEY não configurada")

    async with aiohttp.ClientSession() as session:
        try:
            async with session.get(
                "http://www.omdbapi.com/",
                params={
                    "apikey": api_key,      # Chave da API
                    "t": title,             # Parâmetro de título
                    "type": "movie",         # Filtra apenas filmes
                    "plot": "full",          # Retorna enredo completo
                    "v": "1",                # Versão da API
                },
                timeout=aiohttp.ClientTimeout(total=10) # Timeout de 10 segundos
            ) as response:
                if response.status != 200:
                    return f"Erro ao buscar filme: Status {response.status}"

                data = await response.json()

                if data.get("Response") == "False":
                    return f"Filme não encontrado: {title}"

                return data

        except Exception as e:
            return f"Erro na busca do filme: {title}"