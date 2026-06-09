import os
from dotenv import load_dotenv
load_dotenv()

from langchain_ollama import ChatOllama
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from langgraph.prebuilt import create_react_agent
from agent.tools import consultar_bienes, consultar_informes
from agent.rag import consultar_documentacion_tecnica

# Inicializar el modelo
llm = ChatOllama(
    model=os.getenv("OLLAMA_MODEL", "llama3.2"),
    base_url=os.getenv("OLLAMA_BASE_URL", "http://localhost:11434"),
    temperature=0.3
)

# Herramientas disponibles
tools = [consultar_bienes, consultar_informes, consultar_documentacion_tecnica]

SYSTEM_PROMPT = """Eres un asistente especializado en patrimonio cultural de Gran Canaria.
Tienes acceso a una base de datos con bienes patrimoniales e informes de conservación-restauración.
Usa las herramientas disponibles para responder preguntas con datos reales.
Responde siempre en español y de forma concisa y profesional.
Cuando uses datos de la base de datos, menciona que la información proviene del sistema."""

# Crear agente con LangGraph
agent = create_react_agent(llm, tools)

# Memoria conversacional
conversation_history = {}

def chat(session_id: str, mensaje: str) -> str:
    if session_id not in conversation_history:
        conversation_history[session_id] = []

    messages = [SystemMessage(content=SYSTEM_PROMPT)] + conversation_history[session_id] + [HumanMessage(content=mensaje)]

    result = agent.invoke({"messages": messages})

    respuesta = result["messages"][-1].content

    conversation_history[session_id].append(HumanMessage(content=mensaje))
    conversation_history[session_id].append(AIMessage(content=respuesta))

    return respuesta

def get_history(session_id: str) -> list:
    if session_id not in conversation_history:
        return []

    return [
        {
            "role": "user" if isinstance(m, HumanMessage) else "assistant",
            "content": m.content
        }
        for m in conversation_history[session_id]
    ]
