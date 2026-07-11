from prompts import *
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.websearch import WebSearchTools
from dotenv import load_dotenv
from models.movies import MovieRecommendation
import asyncio
from tools.omdb import search_movie

load_dotenv()

movie_recommendation_agent = Agent(
    name="FilmPro",
    tools=[WebSearchTools(backend="duckduckgo"), search_movie],
    model=OpenAIChat(id="gpt-4o"),
    description=description,
    instructions=instructions,
    markdown=True,
    add_datetime_to_context=True,
    output_schema=MovieRecommendation,
    debug_mode=True,
    debug_level=1,
)

input = """Estou procurando filmes similares ao Star Wars. 
Gosto de filmes de ação."""
async def recommendations():
    result = await movie_recommendation_agent.arun(
        input,
        stream=False
    )

    if result and result.content:
        data: MovieRecommendation = result.content
        pretty_json_output = data.model_dump_json(indent=2)
        print(pretty_json_output)

    return result

if __name__ == "__main__":
    asyncio.run(recommendations())