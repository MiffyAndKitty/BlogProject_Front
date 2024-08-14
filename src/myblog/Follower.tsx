import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile,getFollow } from '../services/getService';
import { updateProfile } from '../services/putService';
import { checkPassword } from '../services/postService';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from '../main/Profile';

const Follower: React.FC = () => {
    const { nickname } = useParams();
    const [followers, setFollowers] = useState<any>(null);
    const navigate = useNavigate();
    
    const fetchFollowers = async() =>{
        const email = sessionStorage.getItem('other_email');
        const fetchedFollowers = await getFollow(email);
        setFollowers(fetchedFollowers.data.followedList);
    }


    useEffect(() => {
        
    }, [navigate]);

    useEffect(() => {

    }, []);

   

    return (
        <div className="App">
            <Header pageType="profileSetting" />
            <main className="main-content">
                <Profile pageType="profileSetting" nicknameParam={nickname} />
                <div className="MainPosts-section">
                    <div className="main-container">
                        <div className="container">
                            {followers && (
                                <>
                                    <h1 style={{color:"#FF88D7"}}>{nickname}의 팔로워 관리</h1>
                                    <div className='border'>
                                    <div>
                                     
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

export default Follower;
