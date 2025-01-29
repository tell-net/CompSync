import React, { useState } from 'react';
import '../styles/SignUp.css';
import { useNavigate } from 'react-router-dom';
import { api } from '~/components/utils';

const SignUp: React.FC = () => {
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [gender, setGender] = useState('male');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('user');  // デフォルト値として 'user' を設定
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  //const api = axios.create({baseURL : "http://10.77.113.59:5000/", withCredentials: true})
  // axios.defaults.headers.post['Access-Control-Allow-Origin'] = 'http://10.77.113.59:5000/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMessage('パスワードが一致しません');
      return;
    }

    try {
      const response = await api.post('/register', {
        name,
        birthdate,
        gender,
        email,
        password,
        user_type: userType
      });

      if (response.status === 201) {
        console.log(response.data.message);
        navigate('/login');
      }
    } catch (error) {
      console.error('Registration failed', error);
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error);
      } else {
        setErrorMessage('登録に失敗しました。');
      }
    }

    // フォーム送信後にエラーメッセージをリセット
    setErrorMessage('');
  };

  return (
    <div className="signup-body">
      <div className="signup-container">
        <h1 className="signup-title">登録</h1>
        <form className="signup-form" onSubmit={handleSubmit}>
          <label htmlFor="name" className="signup-label">名前</label>
          <input
            type="text"
            id="name"
            className="signup-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <label htmlFor="birthdate" className="signup-label">生年月日</label>
          <input
            type="date"
            id="birthdate"
            className="signup-input"
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
          />

          <label htmlFor="gender" className="signup-label">性別</label>
          <select
            id="gender"
            className="signup-input"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            required
          >
            <option value="male">男性</option>
            <option value="female">女性</option>
            <option value="other">その他</option>
          </select>

          <label htmlFor="email" className="signup-label">メールアドレス</label>
          <input
            type="email"
            id="email"
            className="signup-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label htmlFor="password" className="signup-label">パスワード</label>
          <input
            type="password"
            id="password"
            className="signup-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <label htmlFor="confirm-password" className="signup-label">パスワード確認</label>
          <input
            type="password"
            id="confirm-password"
            className="signup-input"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="signup-button">登録</button>
        </form>
        {errorMessage && <p id="error-message" className="signup-error-message">{errorMessage}</p>}
      </div>
    </div>
  );
};

export default SignUp;
