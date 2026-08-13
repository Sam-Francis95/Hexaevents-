"""
Provider-agnostic LLM client. Switch OpenAI <-> Azure OpenAI purely via the
LLM_PROVIDER env var — no code changes needed either way. Until real
credentials are added (LLM_PROVIDER=none, the default), this returns a
canned response instead of erroring, so the chatbot feature ships and looks
complete today and lights up the moment credentials land.
"""
from flask import current_app

FALLBACK_MESSAGE = (
    "I'm not fully switched on yet — my AI credentials haven't been configured. "
    "Once the team adds an OpenAI or Azure OpenAI key, I'll be able to answer "
    "questions about events, registration, and deadlines directly. For now, "
    "check the Events page or reach out to your coordinator."
)

SYSTEM_PROMPT = (
    "You are the SmartEvent AI assistant for Hexaware's event platform. "
    "Answer only questions about events, registration, eligibility, "
    "certificates, and deadlines. Be concise and friendly."
)


def ask(message, context=None):
    provider = current_app.config.get("LLM_PROVIDER", "none")
    if provider == "openai":
        return _ask_openai(message, context)
    if provider == "azure":
        return _ask_azure_openai(message, context)
    return FALLBACK_MESSAGE


def _build_messages(message, context):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}]
    if context:
        messages.append({"role": "system", "content": f"Context: {context}"})
    messages.append({"role": "user", "content": message})
    return messages


def _ask_openai(message, context):
    try:
        from openai import OpenAI
    except ImportError:
        current_app.logger.warning("LLM_PROVIDER=openai but the openai package isn't installed.")
        return FALLBACK_MESSAGE

    client = OpenAI(api_key=current_app.config["OPENAI_API_KEY"])
    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=_build_messages(message, context),
    )
    return response.choices[0].message.content


def _ask_azure_openai(message, context):
    try:
        from openai import AzureOpenAI
    except ImportError:
        current_app.logger.warning("LLM_PROVIDER=azure but the openai package isn't installed.")
        return FALLBACK_MESSAGE

    client = AzureOpenAI(
        api_key=current_app.config["AZURE_OPENAI_API_KEY"],
        azure_endpoint=current_app.config["AZURE_OPENAI_ENDPOINT"],
        api_version="2024-08-01-preview",
    )
    response = client.chat.completions.create(
        model=current_app.config["AZURE_OPENAI_DEPLOYMENT"],
        messages=_build_messages(message, context),
    )
    return response.choices[0].message.content
