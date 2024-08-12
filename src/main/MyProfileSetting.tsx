import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile  } from '../services/getService';
import {  updateProfile } from '../services/putService';
import './MyProfileSetting.css';
import * as TYPES from '../types/index';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from './Profile';

const MyProfileSetting: React.FC = () => {
    const { nickname } = useParams();
    const [image, setImage] = useState<string | undefined>(undefined);
    const [userData, setUserData] = useState<TYPES.userData>();
    const [editing, setEditing] = useState<boolean>(false);
    const [formData, setFormData] = useState<TYPES.userData>();
    const navigate = useNavigate();

    const fetchMyProfile = async () => {
        try {
            const fetchedProfile = await getMyProfile(nickname);
            setUserData(fetchedProfile.data);
            setFormData(fetchedProfile.data); // 초기 폼 데이터 설정
            if (fetchedProfile.data.isSelf === false) {
                alert(`잘못된 접근입니다!`);
                navigate('/');
            }
        } catch (err) {
            console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value } as TYPES.userData);
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          const imageUrl = URL.createObjectURL(file);
          setImage(imageUrl); // 올바르게 URL을 setImage에 전달
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (formData) {
                await updateProfile(formData);
                alert('프로필이 성공적으로 업데이트되었습니다.');
                setEditing(false);
                fetchMyProfile(); // 업데이트 후 프로필 새로고침
            }
        } catch (err) {
            console.log('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        fetchMyProfile();
    }, []);

    return (
        <div className="App">
            <Header pageType="logout" />
            <main className="main-content">
                <Profile pageType="myBlog" nicknameParam={nickname} />
                <div className="MainPosts-section">
                    <div className="main-container">
                        <div className="container">
                            {userData && (
                                <>
                                    <h1>{nickname}의 프로필</h1>
                                    <div>
                                        {editing ? (
                                            <form onSubmit={handleSubmit}>
                                                <div>
                                                    <label>프로필 이미지:</label>
                                                    <input type="file" onChange={handleImageChange} />
                                                    {formData?.user_image && (
                                                        <img src={image} alt="프로필 이미지" width="150" />
                                                    )}
                                                </div>
                                                <div>
                                                    <label>닉네임:</label>
                                                    <input
                                                        type="text"
                                                        name="user_nickname"
                                                        value={formData?.user_nickname || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label>로그인 유형:</label>
                                                    <input
                                                        type="text"
                                                        name="user_provider"
                                                        value={formData?.user_provider || ''}
                                                        onChange={handleChange}
                                                        disabled
                                                    />
                                                </div>
                                                <div>
                                                    <label>아이디(이메일):</label>
                                                    <input
                                                        type="email"
                                                        name="user_email"
                                                        value={formData?.user_email || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <div>
                                                    <label>비밀번호:</label>
                                                    <input
                                                        type="password"
                                                        name="user_password"
                                                        value={formData?.user_password || ''}
                                                        onChange={handleChange}
                                                    />
                                                </div>
                                                <button type="submit">저장</button>
                                                <button type="button" onClick={() => setEditing(false)}>
                                                    취소
                                                </button>
                                            </form>
                                        ) : (
                                            <div>
                                                <div>
                                                    <img src={image} alt="프로필 이미지" width="150" />
                                                </div>
                                                <div>닉네임: {userData.user_nickname}</div>
                                                <div>로그인 유형: {userData.user_provider}</div>
                                                <div>아이디(이메일): {userData.user_email}</div>
                                                <div>비밀번호: {userData.user_password}</div>
                                                <div>서비스 가입일: {userData.created_at}</div>
                                                <div>프로필 정보 변경일: {userData.updated_at}</div>
                                                <button onClick={() => setEditing(true)}>수정</button>
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default MyProfileSetting;
