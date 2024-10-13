import React, { useEffect, useState } from "react";
import axios from "axios";
import { snoSel } from '../SnoAtom';
import { useRecoilValue } from 'recoil';
import { useNavigate } from "react-router-dom";

const url = process.env.REACT_APP_API_URL;

// 게시판 글쓰기
const BoardWrite = ({ onSave, backToList, myboard }) => {

    const sno = useRecoilValue(snoSel);
    const navigate = useNavigate();

    // board의 state를 빈 값으로 초기화
    const [board, setBoard] = useState({
        title: '',
        content: '',
    });

    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': sessionStorage.getItem("token"),
        },
    };

    const { title, content } = board;

    const onChange = (e) => {
        const { name, value } = e.target;
        setBoard({
            ...board,
            [name]: value,
        });
    };

    const checkLogin = () => {
        if (sessionStorage.getItem("token") == null) {
            alert("로그인 후 이용 가능합니다.");
            navigate("/");
            return false;
        }
        return true;
    };

    const saveBoard = async () => {
        if (!checkLogin()) return; // 로그인 확인 후 진행

        if (title.trim() === '' || content.trim() === '') {
            alert('제목과 내용은 빈 칸일 수 없습니다.');
            return;
        }

        try {
            await axios.post(`${url}write?sno=${sno}`, JSON.stringify(board), config);
            alert('등록되었습니다.');
            onSave();
        } catch (error) {
            console.error('Error:', error);
            alert('등록에 실패하였습니다.');
        }
    };

    return (
        <div className="flex h-full bg-white items-center justify-center overflow-hidden">
            <div className="w-full bg-white rounded px-5">
                <header>
                    {myboard ? <></> : <h2 className="text-4xl font-bold text-center text-slate-700">게시물 등록</h2>}
                </header>
                <form>
                    <div className="mb-4">
                        <label className="mb-2 text-slate-700" htmlFor="title">제목</label>
                        <input
                            className="w-full rounded-md border-2 py-1.5 px-2 text-slate-700 shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset my-1"
                            type="text"
                            id="title"
                            name="title"
                            value={title}
                            onChange={onChange}
                        />
                    </div>
                    <div className="mb-4">
                        <label className="mb-2 text-slate-700" htmlFor="content">내용</label>
                        <textarea
                            className="w-full rounded-md border-2 px-2 py-1.5 text-slate-700 shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset"
                            id="content"
                            name="content"
                            cols="30"
                            rows={myboard ? 5 : 10}
                            value={content}
                            onChange={onChange}
                        ></textarea>
                    </div>
                    <div className="flex gap-4">
                        <button
                            className="w-full bg-slate-700 hover:bg-slate-400 text-white font-bold py-2 px-4 mb-6 rounded shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset my-3"
                            type="button"
                            onClick={saveBoard}
                        >
                            저장
                        </button>
                        <button
                            className="w-full bg-slate-700 hover:bg-slate-400 text-white font-bold py-2 px-4 mb-6 rounded shadow-sm ring-1 ring-inset ring-gray-400 focus:ring-2 focus:ring-inset my-3"    
                            type="button"
                            onClick={backToList}
                        >
                            취소
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BoardWrite;
