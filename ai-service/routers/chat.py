from fastapi import APIRouter
from pydantic import BaseModel
from agent.agent import chat, get_history

router = APIRouter()

class ChatRequest(BaseModel):
    session_id: str
    mensaje: str

@router.post("/chat")
def chat_endpoint(request: ChatRequest):
    respuesta = chat(request.session_id, request.mensaje)
    return {
        "session_id": request.session_id,
        "respuesta": respuesta
    }

@router.get("/chat/history/{session_id}")
def get_chat_history(session_id: str):
    history = get_history(session_id)
    return {
        "session_id": session_id,
        "history": history
    }
