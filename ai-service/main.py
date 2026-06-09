from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import chat
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(
    title="Patrimonio Info — Agente IA",
    description="API del agente de IA para consulta de bienes patrimoniales",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "https://app-informes-kappa.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router, prefix="/api")

@app.get("/")
def root():
    return {"status": "ok", "mensaje": "Agente IA Patrimonio Info funcionando"}