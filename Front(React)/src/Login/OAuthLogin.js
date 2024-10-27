import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Loading from '../Loading';
import axios from 'axios';

const url = process.env.REACT_APP_API_URL;

const OAuthLogin = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [newConfirmPassword, setNewConfirmPassword] = useState("");

  const [firstLogin, setFirstLogin] = useState(false);

  const handlePasswordChange = async () => {
    if (!newPassword && !newConfirmPassword) { // 공백 입력 시 
      alert('새 비밀번호를 입력하세요.');
      return;
    }
    if (newPassword.length > 16) {
      alert("비밀번호를 16자 이내로 입력해주세요.");
      return;
    } else if (newPassword.length < 6) {
      alert("비밀번호를 6자 이상 입력해주세요.");
      return;
    }

    if (newConfirmPassword.length > 16) {
      alert("비밀번호를 16자 이내로 입력해주세요.");
      return;
    } else if (newConfirmPassword.length < 6) {
      alert("비밀번호를 6자 이상 입력해주세요.");
      return;
    } else if (newPassword !== newConfirmPassword) {
      alert('비밀번호를 확인해주세요.');
      return;
    }

    await fetch(url + "mypage/changepw", {
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
        'Authorization': sessionStorage.getItem('token')
      },
      body: JSON.stringify({
        password: newPassword
      })
    }).then((resp) => {
      if (resp.status === 200) {
        alert('비밀번호가 성공적으로 변경되었습니다.');
        navigate('/login');
      } else {
        alert('비밀번호 변경에 실패했습니다.');
        return;
      }
    });
  };

  // OAuth 로그인 성공시 백엔드에서 리다이렉트한다 이 주소로 
  // http://192.168.55.203:4000/checkToken?token=" + jwtToken
  // 의존성 배열에 따라 url이 바뀌면 해당 useEffect 실행해서 token을 뽑아내서 sessionStorage에 token 저장 
  useEffect(() => {
    const parseToken = new URLSearchParams(location.search);
    const token = "Bearer " + parseToken.get('token');

    if (token) {
      sessionStorage.setItem('token', token);
      checkUser(token); // 토큰을 전달하여 사용자 검증
    } else {
      navigate("/login");
    }
  }, [location.search, navigate]);
  // useLocation의 location.search는 현재 url의 위치, 즉 페이지가 변경되면 
  // 이 useEffect가 실행되므로 http://192.168.55.203:4000/checkToken?token=" + jwtToken으로 리디렉션되고나서 이것에 있는 토큰을 뽑아온다

  // token 저장 이후 유효한 사용자인지 검증
  // 처음 OAuth로 로그인한(비밀번호 변경하지 않은) 사용자인지 아닌지 검증
  const checkUser = async (token) => {
    setLoading(true);

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token // 전달된 토큰 사용
        }
      };
      const resp = await axios.post(`${url}login/checkOAuth`, '', config);
      const userId = resp.data; // 서버에서 사용자 ID가 포함된 응답이 있다고 가정

      // 세션 스토리지에 사용자 ID 저장
      sessionStorage.setItem('userid', userId);

      if (resp.status === 202) {
        alert("첫 로그인이기 때문에 비밀번호 변경이 필요합니다.");
        setFirstLogin(true);
        window.history.pushState({}, '', '/changepw');
      } else if (resp.status === 200) {
        alert("로그인되었습니다.");
        navigate("/"); // 메인 페이지로 이동
      }
    } catch (error) {
      // 에러 처리: 서버에서 문제가 발생했을 때
      if (error.response && error.response.status === 404) {
          alert("사용자를 찾을 수 없습니다.");
          navigate("/login");
      } else {
          alert("로그인에 실패했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (firstLogin) {
    return (
      <div className='flex items-center justify-center w-full h-screen'>
        <div>
          <div>
            <label className="text-xl font-semibold leading-6 text-slate-700">새 비밀번호</label>
            <input className="w-full rounded-md border-2 px-2 py-1.5 text-slate-700 shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset my-2"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="새 비밀번호" />
            <br />
            <label className="text-xl font-semibold leading-6 text-slate-700">새 비밀번호 확인</label>
            <input className="w-full rounded-md border-2 px-2 py-1.5 text-slate-700 shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset my-2"
              type="password"
              value={newConfirmPassword}
              onChange={(e) => setNewConfirmPassword(e.target.value)}
              placeholder="새 비밀번호 확인" />
          </div>
          <button className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset my-1 w-full"
            id="signup-button" onClick={handlePasswordChange}>
            비밀번호 변경
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <Loading />;
  }
};

export default OAuthLogin;
