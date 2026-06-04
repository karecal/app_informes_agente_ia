# Patrimonio Info — Proyecto Final

## ¿En qué consiste?

Aplicación web fullstack para la gestión de informes de conservación-restauración de bienes patrimoniales de Gran Canaria, con un agente de IA integrado que permite consultar y analizar la documentación patrimonial en lenguaje natural.
El proyecto tiene aplicación profesional real — una institución pública de Gran Canaria está interesada en adoptarlo para catalogar su patrimonio cultural.

## Tecnologías

**Frontend**

React 18 + Vite
React Router v6
Context API
CSS Modules

**Backend existente (midterm)**

Node.js + Express
PostgreSQL + Prisma ORM
JWT con roles (ADMIN / RESTAURADOR)

**Microservicio IA (nuevo)**

Python + FastAPI
LangChain + LangGraph
Ollama con modelo Llama 3.2 (local, sin filtración de datos)
ChromaDB para RAG

**Automatización**

N8N con workflow condicional

**Deploy**

Frontend: Vercel
Backend Express: Railway
Microservicio FastAPI: Railway o Render
Base de datos: Railway PostgreSQL

## Funcionalidades

**Ya implementadas (midterm)**

CRUD completo de bienes patrimoniales e informes
Autenticación JWT con roles (admin / restaurador)
Buscador con 6 filtros (municipio, tipo, estilo, patrimonio, año)
Notificación por email al crear informe
15 tests pasando

**Nuevas (proyecto final)**

Interfaz de chat en el frontend para interactuar con el agente
Agente LangGraph con 2 tools:

Tool 1 — consulta BD: responde preguntas sobre bienes e informes ("¿qué bienes hay en Telde en curso?")
Tool 2 — RAG: busca en documentos de informes históricos indexados en ChromaDB ("¿qué materiales se han usado para tratar xilófagos?")

Memoria conversacional que persiste entre turnos
Las respuestas citan las fuentes cuando usan RAG
Workflow N8N con lógica condicional conectado a la API
Documentación Swagger + Postman collection

**Por qué Ollama en lugar de OpenAI**
El proyecto tiene aplicación en una institución pública española. Los datos patrimoniales son sensibles y no deben salir de la infraestructura propia. Ollama permite ejecutar el modelo de IA localmente sin enviar datos a servidores externos, cumpliendo con el RGPD y el ENS.
