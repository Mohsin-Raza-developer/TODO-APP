from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig, set_default_openai_client,set_default_openai_key
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

gemini_config = RunConfig(
    model= model,
    tracing_disabled=False,  # Enabled for debugging

)


# Use client configured with settings (no need to set key again)
# set_default_openai_client(client=external_client, use_for_tracing=True)
# Key is already configured in external_client from settings.openai_api_key
# set_default_openai_key(key=settings.openai_api_key, use_for_tracing=True)

