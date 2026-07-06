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
├── FilmPro_v1/     # Versão funcional do agente
│   ├── main.py             # Ponto de entrada — instancia e executa o agente
│   ├── prompts/
│   │   └── movie_search.py # Descrição e instruções do agente
│   └── requirements.txt
└── FilmPro_v2/     # Próxima versão, em desenvolvimento (ainda sem código)
    └── requirements.txt
```

> A versão atual e funcional do projeto é a **FilmPro_v1**. A pasta `FilmPro_v2` é um scaffold para a próxima iteração e ainda não contém implementação.

## Pré-requisitos

- Python 3.11+
- Uma chave de API da OpenAI ([platform.openai.com](https://platform.openai.com))

## Setup

```bash
cd FilmPro_v1

# Criar e ativar o ambiente virtual
python -m venv .venv
.venv\Scripts\activate      # Windows
# source .venv/bin/activate # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Configurar a API key (crie o arquivo .env)
echo OPENAI_API_KEY=sua_chave_aqui > .env
```

## Executando

```bash
python main.py
```

A consulta padrão de exemplo está definida em `FilmPro_v1/main.py` (variável `input`). Para recomendar filmes com base em outras preferências, edite essa variável com a descrição desejada.

## Stack

- **[Agno](https://github.com/agno-agi/agno)** — framework de agentes de IA
- **OpenAI GPT-4o** — modelo de linguagem
- **DuckDuckGo Search (`ddgs`)** — busca na web para dados atualizados de filmes
- **python-dotenv** — carregamento de variáveis de ambiente
