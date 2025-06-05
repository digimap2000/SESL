import openai
import os

def main():
    openai.api_key = os.getenv("OPENAI_API_KEY")
    if not openai.api_key:
        raise RuntimeError("Please set the OPENAI_API_KEY environment variable")

    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt="Say hello in a friendly way.",
        max_tokens=20,
        temperature=0.7,
    )
    print(response.choices[0].text.strip())

if __name__ == "__main__":
    main()
