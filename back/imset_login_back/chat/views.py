from django.http import JsonResponse
from rest_framework.decorators import api_view
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate

# Configure the model and prompt
template = """
Answer the question below.

Here is the conversation history: {context}
Question: {question}

Answer:
"""

model = OllamaLLM(model="llama3")
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model


AI_NAME = "Mr Ladhari"  # Change to your preferred AI name
DEFAULT_AI_NAME = "llama"  # The default AI name from the model

@api_view(['POST'])
def handle_conversation(request):
    data = request.data
    user_input = data.get('question', '')
    context = data.get('context', '')

    if user_input.lower() == "exit":
        return JsonResponse({"message": "Conversation ended."})

    # Generate the response with the model
    result = chain.invoke({"context": context, "question": user_input})
    # print("Mr Ladhari : ",result)

    # Update the context
    context += f"\nUser: {user_input}\n{AI_NAME}: {result}"
# \nMr Ladhari: {result}
    return JsonResponse({"response": result, "context": context})