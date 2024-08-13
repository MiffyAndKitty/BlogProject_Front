import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../services/getService';
import { updateProfile } from '../services/putService';
import './MyProfileSetting.css';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from './Profile';

const MyProfileSetting: React.FC = () => {
    const { nickname } = useParams();
    const [newNick, setNewNick] = useState<string>('');
    const [image, setImage] = useState<string | null>(null);
    const [saveImage, setSaveImage] = useState<File | null>(null);
    const [userData, setUserData] = useState<any>(null);
    const [editingField, setEditingField] = useState<string | null>(null);
    const navigate = useNavigate();

    const fetchMyProfile = async () => {
        try {
            const sessionStorageEmail = sessionStorage.getItem('email');
            const fetchedProfile = await getMyProfile(sessionStorageEmail);
            setUserData(fetchedProfile.data);
            setNewNick(fetchedProfile.data.user_nickname);

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
        if (name === 'user_nickname') {
            setNewNick(value);
        }
         // userData 업데이트 (새로운 상태 메시지 반영)
        setUserData(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSaveImage(file); // 파일을 상태에 저장
            setImage(URL.createObjectURL(file)); // 이미지 미리보기 설정
        }
    };

    const handleSubmit = async () => {
        const formData = new FormData();
        formData.append('nickname', newNick);
        formData.append('password', userData.user_password || '');
        formData.append('statusMessage', userData.user_message || '');

        if (saveImage) {

            formData.append('uploaded_files', saveImage); // FormData에 파일 추가
        }

        try {
            await updateProfile(formData);
            console.log(`===========================
                         ============프로필===========
                         newNick ${newNick}
                         userData.user_message  ${userData.user_message }
                         `)
            alert('프로필이 성공적으로 업데이트되었습니다.');
            sessionStorage.setItem('nickname', newNick);
            setEditingField(null);
            fetchMyProfile(); // 업데이트 후 프로필 새로고침
            window.location.reload();
            navigate(`/myProfileSetting/${newNick}`);
        } catch (err) {
            console.log('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };

    useEffect(() => {
        fetchMyProfile();
    }, [navigate]);

    useEffect(() => {
        
        fetchMyProfile();
        
    }, []);

    const renderField = (label: string, field: string, type: string = "text", isEditable: boolean = true) => (
        <div>
            <label>{label}:</label>
            {editingField === field && isEditable ? (
                <div>
                    <input
                        type={type}
                        name={field}
                        defaultValue={userData ? userData[field] : ''}
                        onChange={handleChange}
                    />
                    <button onClick={handleSubmit}>저장</button>
                    <button onClick={() => setEditingField(null)}>취소</button>
                </div>
            ) : (
                <div>
                    <span>{userData ? userData[field] : ''}</span>
                    {isEditable && <button onClick={() => setEditingField(field)}>수정</button>}
                </div>
            )}
        </div>
    );

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
                                        <div>
                                            <label>프로필 이미지:</label>
                                            {editingField === 'uploaded_files' ? (
                                                <div>
                                                    <input type="file" onChange={handleImageChange} />
                                                    {image && <img src={image} alt="프로필 이미지" width="150" />}
                                                    <button onClick={handleSubmit}>저장</button>
                                                    <button onClick={() => setEditingField(null)}>취소</button>
                                                </div>
                                            ) : (
                                                <div>
                                                    {userData.user_image && <img src={userData.user_image} alt="프로필 이미지" width="150" />}
                                                    <button onClick={() => setEditingField('uploaded_files')}>수정</button>
                                                </div>
                                            )}
                                        </div>
                                        {renderField('닉네임', 'user_nickname')}
                                        {renderField('아이디(이메일)', 'user_email', 'email', false)} {/* 수정 불가 */}
                                        { userData.user_provider !== 'google' && (renderField('비밀번호', 'user_password', 'password' ))} {/* Google 계정일 경우 수정 불가 */}
                                        {renderField('상태 메시지', 'user_message')}
                                        <div>
                                            <label>서비스 가입일:</label>
                                            <span>{userData.created_at}</span>
                                        </div>
                                        <div>
                                            <label>프로필 정보 변경일:</label>
                                            <span>{userData.updated_at}</span>
                                        </div>
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
