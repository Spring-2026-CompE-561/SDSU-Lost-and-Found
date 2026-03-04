# backend/src/app/services/chat_service.py
def get_or_create_conversation(current_user_id: int, recipient_id: int):
    raise NotImplementedError

def list_conversations(current_user_id: int, limit: int = 50, offset: int = 0):
    raise NotImplementedError

def delete_conversation(current_user_id: int, conversation_id: int):
    raise NotImplementedError

def get_messages(current_user_id: int, conversation_id: int, limit: int = 50, offset: int = 0):
    raise NotImplementedError

def send_message(current_user_id: int, conversation_id: int, content: str):
    raise NotImplementedError

def delete_message(current_user_id: int, message_id: int):
    raise NotImplementedError