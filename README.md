# FilmPro — Agente de Recomendação de Filmes

Agente de IA que recomenda filmes personalizados com base nas preferências do usuário, usando o framework [Agno](https://github.com/agno-agi/agno) com um modelo da OpenAI (GPT-4o) e busca na web para trazer informações atualizadas.

## Como funciona

O agente recebe uma descrição em linguagem natural das preferências do usuário (gêneros favoritos, filmes de referência, temas de interesse) e:

1. Analisa as preferências e temas mencionados.
2. Pesquisa filmes relevantes na web (DuckDuckGo).
3. Retorna no mínimo 5 recomendações, sem repetições, cada uma com título, ano, gênero, nota IMDB (foco em 7.5+), duração, sinopse, elenco/diretor e avisos de classificação.
4. Responde sempre em português e em Markdown, com as recomendações organizadas em tabela.

## Estrutura do repositório

```
├── FilmPro_v1/     # Script de linha de comando (agente puro, sem API)
│   ├── main.py             # Ponto de entrada — instancia e executa o agente
│   ├── prompts/
│   │   └── movie_search.py # Descrição e instruções do agente
│   └── requirements.txt
├── FilmPro_v2/     # Agente com ferramenta OMDb (busca web + consulta à API OMDb)
│   ├── main.py
│   ├── models/movies.py    # Schema Pydantic de saída estruturada
│   ├── prompts/movie_search.py
│   ├── tools/omdb.py       # Ferramenta customizada de consulta à API OMDb
│   └── requirements.txt
├── FilmPro_v3/     # Mesmo agente exposto via API FastAPI
│   ├── main.py              # Sobe a API (uvicorn) em vez de rodar no console
│   ├── agent/                # Núcleo do agente (config, core, models, prompts, tools)
│   ├── api/                  # App FastAPI + rotas (`POST /recommendations`)
│   └── requirements.txt
└── FilmPro_v4/     # API FastAPI + site estático de front-end
    ├── main.py               # Sobe a API (uvicorn) — igual à v3
    ├── agent/                 # Núcleo do agente (config, core, models, prompts, tools)
    ├── api/                   # App FastAPI + rotas (`POST /recommendations`)
    ├── site/                  # Front-end estático (HTML/CSS/JS) que consome a API
    │   ├── index.html
    │   ├── css/styles.css
    │   └── js/app.js
    └── requirements.txt
```

> A versão atual e funcional do projeto é a **FilmPro_v4**, que reúne a API FastAPI (herdada da FilmPro_v3) e um site estático em `FilmPro_v4/site/` para consumir as recomendações pelo navegador. As pastas anteriores (`FilmPro_v1` a `FilmPro_v3`) são mantidas como histórico da evolução do projeto.

## Pré-requisitos

- Python 3.11+
- Uma chave de API da OpenAI ([platform.openai.com](https://platform.openai.com))
- Uma chave de API da OMDb ([omdbapi.com](https://www.omdbapi.com/apikey.aspx)) — necessária a partir da FilmPro_v2

## Setup (FilmPro_v4)

```bash
cd FilmPro_v4

# Criar e ativar o ambiente virtual
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Configurar as API keys (crie o arquivo .env)
echo OPENAI_API_KEY=sua_chave_aqui > .env
echo OMDB_API_KEY=sua_chave_aqui >> .env
```

## Executando

A FilmPro_v4 tem duas partes que rodam separadamente: a **API** (backend) e o **site** (frontend estático). O site faz chamadas para a API em `http://localhost:8000`, então a API precisa estar no ar para as buscas funcionarem.

**1. Subir a API** (a partir de `FilmPro_v4`):

```bash
python main.py
```
ou diretamente com uvicorn:
```bash
uvicorn api.app:app --reload
```

A API sobe em `http://localhost:8000`, com documentação interativa em `/docs` (Swagger) e `/redoc`.

**2. Subir o site** (em outro terminal, a partir de `FilmPro_v4/site`):

```bash
cd site
python -m http.server 5500
```

Acesse `http://localhost:5500` no navegador. Qualquer servidor estático funciona (Live Server do VS Code, `npx serve`, etc.) — o único requisito é rodar em uma porta diferente de `8000` e com a API já no ar.

> Para as versões anteriores sem API (`FilmPro_v1`, `FilmPro_v2`), o agente roda direto no console com `python main.py` dentro da respectiva pasta.

## Stack

- **[Agno](https://github.com/agno-agi/agno)** — framework de agentes de IA
- **OpenAI GPT-4o** — modelo de linguagem
- **DuckDuckGo Search** — busca na web para dados atualizados de filmes
- **OMDb API** — dados estruturados de filmes (nota IMDB, elenco, sinopse etc.)
- **FastAPI + Uvicorn** — API HTTP que expõe o agente (`FilmPro_v3` e `FilmPro_v4`)
- **HTML/CSS/JS + Tailwind (CDN)** — site estático que consome a API (`FilmPro_v4/site`)
- **python-dotenv** — carregamento de variáveis de ambiente
