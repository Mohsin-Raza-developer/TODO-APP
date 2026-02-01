from agents import AsyncOpenAI, OpenAIChatCompletionsModel, RunConfig
from agents import Agent, Runner
from dotenv import load_dotenv
import os 

load_dotenv()
api_key = os.getenv("geini_api_key")


# enable_verbose_stdout_logging()
    

external_client = AsyncOpenAI(
        api_key = api_key,
        base_url = "https://generativelanguage.googleapis.com/v1beta/openai/",
    )


model = OpenAIChatCompletionsModel(
    model="gemini-2.5-flash",
    openai_client=external_client,
)

config = RunConfig(
    model= model,
    tracing_disabled=True,

)


agent = Agent(
    name = 'assisent',
    instructions="you are helpful agent",
    
)

async def main():
    result = await Runner.run(agent,"hi",run_config=config)
    print(result)
    return result


if __name__ == "__main__":
    import asyncio
    asyncio.run(main())