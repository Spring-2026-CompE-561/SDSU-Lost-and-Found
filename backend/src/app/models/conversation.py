from sqlalchemy import Column, ForeignKey, Integer
from sqlalchemy.orm import relationship
#from datetime import datetime, timezone

from app.core.db import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id1 = Column(Integer, ForeignKey("users.id"), nullable=False)
    user_id2 = Column(Integer, ForeignKey("users.id"), nullable=False)
    #created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))

    user1 = relationship("User", foreign_keys=[user_id1])
    user2 = relationship("User", foreign_keys=[user_id2])


<<<<<<< HEAD
        #Messages name needs to match with tablename of message data model -  To make sure messages would get delete if a conversation is deleted 
    messages = relationship("messages", back_populates="conversation", cascade="all, delete")
=======

                            #Messages name needs to match with tablename of message data model -  To make sure messages would get delete if a conversation is deleted 
    #messages = relationship("Messages", back_populates="conversation", cascade="all, delete")
>>>>>>> 83cfa304a33947050b9682f29ffa7fa13e706fce


