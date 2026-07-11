from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.websearch import WebSearchTools

from .models.movies import MovieRecommendation
from .prompts import *
from .tools.omdb import search_movie

from .config import Config
Config.validate()

movie_recommendation_agent = Agent(
    name="FilmPro",
    tools=[WebSearchTools(backend="duckduckgo"), search_movie],
    model=OpenAIChat(id="gpt-4o", api_key=Config.OPENAI_API_KEY),
    description=description,
    instructions=instructions,
    markdown=True,
    add_datetime_to_context=True,
    output_schema=MovieRecommendation,
    debug_mode=True,
    debug_level=1,
)

async def recommendations(preferences: str):
    result = await movie_recommendation_agent.arun(
        preferences,
        stream=False
    )

    if result and result.content:
        data: MovieRecommendation = result.content
        pretty_json_output = data.model_dump_json(indent=2)
        print(pretty_json_output)
        return data