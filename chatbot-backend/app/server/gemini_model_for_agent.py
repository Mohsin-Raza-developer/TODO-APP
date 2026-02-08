from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig, set_default_openai_client, set_default_openai_key
from app.config import settings
# enable_verbose_stdout_logging()
    

external_client = AsyncOpenAI(
        api_key = settings.openai_api_key,
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/",
    )


model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=external_client,
)

# Set OpenAI key for tracing (separate from Gemini key)
if settings.openai_tracing_api_key:
    set_default_openai_key(key=settings.openai_tracing_api_key, use_for_tracing=True)
    tracing_enabled = True
else:
    tracing_enabled = False

gemini_config = RunConfig(
    model=model,
    tracing_disabled=not tracing_enabled,  # Enable if tracing key is set
)
