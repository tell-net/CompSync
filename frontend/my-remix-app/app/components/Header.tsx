import React, { useState, useEffect, useCallback } from 'react';
import { api, authAtom, User } from '~/components/utils';
import { useAtom } from "jotai";
import { useNavigate } from "react-router-dom";
import { Link } from "@remix-run/react";

const Header: React.FC = () => {
  const [auth, setAuth] = useAtom(authAtom);
  const navigate = useNavigate();

  const checkAuthStatus = async () => {
    try {
      const response = await api.get('/auth_status');
      if (response.data.authenticated) {
        setAuth(response.data.user);
      } else {
        setAuth(undefined);
      }
    } catch (error) {
      console.error('Error checking auth status', error);
      setAuth(undefined);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      setAuth(undefined);
      // localStorage.clear(); // ローカルストレージの中身を削除
      navigate("/login"); // ログアウト後にログインページにリダイレクト
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <header>
      <nav className="navbar" role="navigation" aria-label="main navigation">
        <div className="navbar-brand">
          <a className="navbar-item" href="/">
            <img src="/CompSync.png" id="compsynclogo" />
          </a>
          <a role="button" className="navbar-burger" aria-label="menu" aria-expanded="false" data-target="navbarBasicExample">
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
            <span aria-hidden="true"></span>
          </a>
        </div>

        <div id="navbarBasicExample" className="navbar-menu">
          <div className="navbar-start">
            <Link className="navbar-item" to="/">
              Map
            </Link>
            {/* <a className="navbar-item" href="/">
              Map
            </a> */}

            <a className="navbar-item">
              Community
            </a>

            {/* <Link className="navbar-item" to="/Chat">
              Message
            </Link> */}

            <Link className="navbar-item" to="/Chat">
              Message
            </Link>
          </div>

          <div className="navbar-end">
            <div className="navbar-item">
              <div className="buttons">
                {auth ? (
                  <>
                    {auth.user_type === 'company' && (
                      <a className="button is-info" href="/corp">
                        Corp.
                      </a>
                    )}
                    <a className="button is-primary" href="/account">
                      Account
                    </a>
                    <a className="button is-light is-dark" onClick={handleLogout}>
                      Log out
                    </a>
                  </>
                ) : (
                  <>
                    <a className="button is-link" href="/signup">
                      <strong>Sign up</strong>
                    </a>
                    <a className="button is-light is-dark" href="/login">
                      Log in
                    </a>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
