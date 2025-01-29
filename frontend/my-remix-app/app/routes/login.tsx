import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/login.css'; // CSSファイルのインポート
import { api, authAtom, User } from '~/components/utils';
import { useAtom } from "jotai";


const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await api.post('/login', {
        email: username,
        password: password
      });
      if (response.status === 200) {
        console.log(response.data.message);
        const user: User = response.data.user;
        setAuth(user);
        navigate('/');  // ホームページにリダイレクト
      }
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <div className="login-body">
      <div className="login-container">
        <form id="signinForm" onSubmit={handleLogin}>
          <label className="login-label" htmlFor="username">ユーザー名</label>
          <input
            type="text"
            id="username"
            name="username"
            className="login-input"
            placeholder="ユーザー名"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <label className="login-label" htmlFor="password">パスワード</label>
          <input
            type="password"
            id="password"
            name="password"
            className="login-input"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="login-button">ログイン</button>
        </form>
        <p>アカウントをお持ちでないですか？ <a href="/signup">登録</a> はこちらから</p>
        <p>パスワードを忘れましたか？ <a href="/reset">パスワードリセット</a> はこちらから</p>
      </div>
    </div>
  );
};

export default Login;
