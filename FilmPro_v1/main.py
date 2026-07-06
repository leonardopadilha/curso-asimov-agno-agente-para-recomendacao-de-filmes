from prompts import *
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.websearch import WebSearchTools
from dotenv import load_dotenv

load_dotenv()

movie_recommendation_agent = Agent(
    name="FilmPro",
    tools=[WebSearchTools(backend="duckduckgo")],
    model=OpenAIChat(id="gpt-4o"),
    description=description,
    instructions=instructions,
    markdown=True,
    add_datetime_to_context=True,
)

input = """
Estou procurando filmes similares ao Independence Day.
Gosto de filmes de ficção científica com ação, invasão alienígena e espetáculos visuais impressionantes.
"""

if __name__ == "__main__":
    movie_recommendation_agent.print_response(
        input=input,
        stream=True,
    )