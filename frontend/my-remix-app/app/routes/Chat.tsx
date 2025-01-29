import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import '../styles/Chat.css';
import moment from 'moment';
import { useAtom } from 'jotai';
import { api, authAtom } from '~/components/utils';

const socket = io('http://10.77.113.59:5000', { withCredentials: true });

const Chat: React.FC = () => {
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [chatList, setChatList] = useState<{ email: string, latest_message: string, name: string, timestamp: string }[]>([]);
  const [conversations, setConversations] = useState<{ [key: string]: any[] }>({});
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState([]);
  const [auth] = useAtom(authAtom);

  const getUsersWithMessages = async () => {
    try {
      const response = await api.get('/users_with_messages');
      setChatList(response.data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error fetching users with messages:', error.message);
    }
  };

  const searchUsers = async (term: string) => {
    try {
      const response = await api.get(`/search_users?term=${term}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error.message);
    }
  };

  const getMessagesWith = async (personEmail: string) => {
    try {
      const response = await api.get(`/get_messages_with?other_email=${personEmail}`, { withCredentials: true });
      setConversations(prevConversations => ({
        ...prevConversations,
        [personEmail]: response.data
      }));
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  useEffect(() => {
    if (activeChat) {
      getMessagesWith(activeChat);
    }
  }, [activeChat]);

  useEffect(() => {
    getUsersWithMessages();
    socket.on('new_message', (message) => {
      console.log("new message!");
      console.log(message);
      if (!activeChat) return;
      if (message.sender_email === activeChat || message.receiver_email === activeChat) {
        setConversations(prevConversations => ({
          ...prevConversations,
          [activeChat]: [...prevConversations[activeChat], message]
        }));
      } else {
        getUsersWithMessages();
      }
    });

    return () => {
      socket.off('new_message');
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      searchUsers(searchTerm);
    } else {
      setSearchResults([]);
    }
  }, [searchTerm]);

  const handlePersonClick = (personEmail: string) => {
    setActiveChat(personEmail);
    setSearchTerm('');
    setSearchResults([]);
    if (!chatList.some((person: any) => person.email === personEmail)) {
      setChatList((prevChatList) => {
        return [
          ...prevChatList,
          { email: personEmail, name: searchResults.find((person: any) => person.email === personEmail)?.name || 'Unknown', latest_message: '', timestamp: new Date().toISOString() }
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      });
    }
  };

  const handleSendMessage = (message: string) => {
    if (message && activeChat) {
      api.post('/send_message', {
        receiver_email: activeChat,
        message: message
      }).then(() => {
        (document.querySelector('.chat-write input') as HTMLInputElement).value = '';
      });
      // .then(response => {
      //   setConversations(prevConversations => ({
      //     ...prevConversations,
      //     [activeChat]: [...prevConversations[activeChat], {
      //       sender_email: auth?.email,
      //       message: message,
      //       timestamp: new Date().toISOString()
      //     }]
      //     // ...prevConversations,
      //     // [activeChat]: [...prevConversations[activeChat], {
      //     //   sender_email: auth?.email,
      //     //   message: message,
      //     //   timestamp: new Date().toISOString()
      //     // }]
      //   }));
      //   getUsersWithMessages();
      //   (document.querySelector('.chat-write input') as HTMLInputElement).value = '';
      // }).catch(error => {
      //   console.error('Error sending message:', error);
      // });
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-container">
        <div className="chat-left">
          <div className="chat-top">
            <input 
              type="text" 
              placeholder="Search" 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
            />
            <a href="#" className="chat-search"></a>
          </div>
          <ul className="chat-people">
            {searchTerm ? (
              searchResults.map((person: any) => (
                <li key={person.email} className="chat-person" onClick={() => handlePersonClick(person.email)}>
                  <img src={'https://via.placeholder.com/40'} alt="" />
                  <span className="chat-name">{person.name}</span>
                </li>
              ))
            ) : (
              chatList
                .map((person: any) => (
                  <li key={person.email} className={`chat-person ${activeChat === person.email ? 'chat-active' : ''}`} onClick={() => handlePersonClick(person.email)}>
                    <img src={'https://via.placeholder.com/40'} alt="" />
                    <span className="chat-name">{person.name}</span>
                    <span className="chat-time">{moment(person.timestamp).format('LT')}</span>
                    <span className="chat-preview">{person.latest_message}</span>
                  </li>
                ))
            )}
          </ul>
        </div>
        <div className="chat-right">
          <div className="chat-top"><span>To: <span className="chat-name">{chatList.find((person: any) => person.email === activeChat)?.name}</span></span></div>
          {Object.entries(conversations).map(([personEmail, messages]) => (
            <div key={personEmail} className={`chat-chat ${activeChat === personEmail ? 'chat-active-chat' : ''}`} data-chat={personEmail}>
              {messages.map((message, index) => (
                <div key={index} className={`chat-bubble ${message.sender_email === auth?.email ? 'me' : 'you'}`}>
                  {message.message}
                </div>
              ))}
            </div>
          ))}
          <div className="chat-write">
            <a href="#" className="chat-write-link chat-attach"></a>
            <input type="text" onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage((e.target as HTMLInputElement).value); }} />
            <a href="#" className="chat-write-link chat-send" onClick={() => handleSendMessage((document.querySelector('.chat-write input') as HTMLInputElement).value)}></a>
            <a href="#" className="chat-write-link chat-smiley"></a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
