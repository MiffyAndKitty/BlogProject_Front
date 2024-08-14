import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollow } from '../services/getService';
import { deleteFollow } from '../services/deleteService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';
import mainCharacterImg from '../img/main_character.png';
import deleteFollowImg from '../img/deleteFollow.png';
import './Follow.css';
import ConfirmModal from './ConfirmModal'; 

const Follow: React.FC = () => {
    const { nickname } = useParams();
    const [followers, setFollowers] = useState<any[]>([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nicknameToDelete,setNicknameToDelete] = useState('');
    const fetchFollowers = async () => {
        const email = sessionStorage.getItem('other_email');
        if (email) {
            const fetchedFollowers = await getFollow(email);
            setFollowers(fetchedFollowers.data.followingList);
            console.log(`fetchedFollowers.data.followedList`,fetchedFollowers.data.followingList)
        }
    };

    const deleteFollowers = async (email:string) => {
        
        try{
            if (email) {
                const fetchedFollowers = await deleteFollow(email);
                if(fetchedFollowers){
                    alert('팔로우를 취소했습니다!');
                    navigate(`/follow/${nickname}`);
                } 
                else alert('팔로우 취소에 실패했습니다! 다시 시도해주세요.');
            }
        }catch{
            
        }
       
    };

    useEffect(() => {
        fetchFollowers();
    }, [navigate]);
    const handleDelete = (nicknameToDelete: string) => {
        setNicknameToDelete(nicknameToDelete);
        setIsModalOpen(true);
        
    
        // 여기서 서버에 삭제 요청을 보낼 수도 있습니다.
        
    };
    return (
        <div className="App">
            <Header pageType="profileSetting" />
            <main className="main-content">
                <Profile pageType="profileSetting" nicknameParam={nickname} />
                <div className="MainPosts-section">
                    <div className="main-container">
                        <div className="container">
                            <h1 style={{color:"#FF88D7"}}>{nickname}의 팔로우 관리</h1>
                            <div className='border'>
                                <div >
                                    {followers.length > 0 ? (
                                        <div className='followers-list'>
                                            {followers.map((follower, index) => (
                                                <div key={follower.user_nickname} className="follower-item">
                                                    <div className="follower-image-wrapper">
                                                        <img src={follower.user_image || mainCharacterImg} alt="Profile" className="heart" onClick={() => navigate(`/${follower.user_nickname}`)}/>
                                                        <img src={deleteFollowImg} className="delete-button" onClick={() => handleDelete(follower.user_nickname)}></img>
                                                        <ConfirmModal
                                                          isOpen={isModalOpen}
                                                          onClose={() => setIsModalOpen(false)}
                                                          onConfirm={() => deleteFollowers(follower.user_email)}
                                                          message="해당 팔로우를 삭제하시겠습니까?"
                                                        />
                                                    </div>
                                                    <div style={{fontWeight:'bold', fontSize:'12px'}}> {follower.user_nickname}</div> 
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p>팔로워가 없습니다.</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default Follow;
