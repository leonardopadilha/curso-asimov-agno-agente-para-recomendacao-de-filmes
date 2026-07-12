# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão geral do projeto

FilmPro é um serviço FastAPI que envolve um agente de IA [Agno](https://github.com/agno-agi/agno) para gerar recomendações de filmes estruturadas. O agente (GPT-4o via OpenAI) combina busca na web via DuckDuckGo com uma ferramenta de consulta à API OMDb e retorna um payload JSON validado por Pydantic (`MovieRecommendation`).

## Configuração

- Python 3.11 (já existe um `.venv` na raiz do repositório).
- Dependências: `pip install -r requirements.txt` (atenção: este arquivo foi salvo em UTF-16 e pode precisar ser resalvo como UTF-8/regenerado via `pip freeze` caso o editor o corrompa).
- Variáveis de ambiente obrigatórias em `.env`: `OPENAI_API_KEY`, `OMDB_API_KEY`. Ambas são validadas no momento da importação por `Config.validate()` (`agent/config.py`), chamada tanto em `agent/core.py` quanto em `agent/tools/omdb.py` — chaves ausentes disparam um `ValueError` imediatamente na inicialização.

## Comandos comuns

Rodar a API (auto-reload na porta 8000):
```
python main.py
```
ou diretamente com uvicorn:
```
uvicorn api.app:app --reload
```

A documentação interativa da API fica disponível em `/docs` (Swagger) e `/redoc` quando a aplicação está rodando.

Atualmente não há suíte de testes, linter ou formatador configurados neste projeto.

## Arquitetura

Fluxo da requisição: `main.py` → `api/app.py` (app FastAPI + CORS) → `api/routers.py` (`POST /recommendations`) → `agent/core.py` (`recommendations()`) → `Agent.arun()` do Agno.

- **`agent/core.py`** monta o agente singleton `movie_recommendation_agent` (`Agent` do Agno) no momento da importação com:
  - `model`: `OpenAIChat(id="gpt-4o", ...)`
  - `tools`: `WebSearchTools(backend="duckduckgo")` e `search_movie` (ferramenta customizada de OMDb)
  - `output_schema=MovieRecommendation` — o Agno garante que a saída final do agente esteja em conformidade com esse modelo Pydantic, então `result.content` já é um `MovieRecommendation` tipado, não texto bruto.
  - `debug_mode=True` — o agente imprime rastros verbosos de chamadas de ferramentas/raciocínio no stdout.
- **`agent/prompts/movie_search.py`** contém as strings `description`/`instructions` (em português) que orientam o comportamento do agente — por exemplo, mínimo de 5 / máximo de 20 filmes, `recommendation_reason` obrigatório por filme, pelo menos 2 membros do elenco, saída sempre em português mesmo que a consulta do usuário não esteja. Ao alterar o comportamento das recomendações, este é quase sempre o arquivo a ser editado, em vez do código do agente.
- **`agent/models/movies.py`** define o schema de resposta (`MovieRecommendation` → lista de `Movie`, cada um com entradas `Cast`). Esse schema é tanto o response model do FastAPI (via `api/routers.py`) quanto o contrato de saída estruturada do Agno para o LLM — alterar um campo aqui muda o que é pedido ao LLM.
- **`agent/tools/omdb.py`** é uma função async simples (`search_movie`) registrada diretamente como ferramenta do Agno; ela chama a API OMDb e retorna o dict JSON ou uma string de erro em português (ferramentas do Agno podem retornar ambos).
- **`api/routers.py`** encapsula `recommendations()` em um envelope `RecommendationResponse` (`success`, `data`, `message`) e mapeia qualquer exceção para um 500 com a mensagem de erro em `detail`.

## Outras observações

- `design/ai-social-automation.aura.build/` contém um export estático de design system do aura.build, sem relação com o código FastAPI/agente — são apenas assets de referência/mockup, não fazem parte da aplicação em execução.
- `api/__init__py` está sem o ponto (não é `__init__.py`) — o pacote `api` atualmente não possui um `__init__.py` de verdade.
