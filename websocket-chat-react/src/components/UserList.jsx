import React, { useContext } from 'react';
import { ChatContext } from '../context/ChatContext';
import "../styles/global.css"

const UserList = () => {
  const { users, currentUser } = useContext(ChatContext);

  return (
    <div className="user-list">
      <h3>Online Users</h3>
      {users.length === 0 ? (
        <div>No users online</div>
      ) : (
        users.map(user => (
          <div key={user} className={user === currentUser ? 'me' : ''}>
            {user}
          </div>
        ))
      )}
    </div>
  );
};

export default UserList;
