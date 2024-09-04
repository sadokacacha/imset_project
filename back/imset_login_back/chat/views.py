from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from users.serializers import CustomTokenObtainPairSerializer  # Import from users app

# Custom Token View
class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer

# Configure the AI model and prompt
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

@api_view(['POST'])
@permission_classes([IsAuthenticated])  # Ensure the view is protected by authentication
def handle_conversation(request):
    data = request.data
    user_input = data.get('question', '')
    context = data.get('context', '')

    if user_input.lower() == "exit":
        return JsonResponse({"message": "Conversation ended."})

    try:
        # Generate the response using the AI model
        result = chain.invoke({"context": context, "question": user_input})
        return JsonResponse({
            "response": result["answer"],
            "context": result["context"]
        })
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)