import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollow } from '../services/getService';
import { deleteFollow } from '../services/deleteService';
import mainCharacterImg from '../img/main_character.png';
import deleteFollowImg from '../img/deleteFollow.png';
import { followUser } from '../services/postService';
import './Follow.css';
import FollowDeleteModal from './FollowDeleteModal'; 
import bothFriendImg from '../img/both_friend.png';
import friendImg from '../img/friend.png';
import nonFriendImg from '../img/nonFriend.png';
import { set } from 'date-fns';

interface FollowModalProps {
    onClose: () => void;
    isOthers?: boolean
}

const Follower: React.FC<FollowModalProps> = ({ onClose ,isOthers}) => {
    const { nickname } = useParams();
    const [followers, setFollowers] = useState<any[]>([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nicknameToDelete, setNicknameToDelete] = useState('');
    const [localEmail, setLocalEmail] = useState('');
    const [hoveredFollower, setHoveredFollower] = useState<string | null>(null);

    const fetchFollowers = async () => {
        if(isOthers===true){
            const email = sessionStorage.getItem('other_email');
            if (email) {
                const fetchedFollowers = await getFollow(email);
                setFollowers(fetchedFollowers.data.followersList);
            }
        }else{
            const email = sessionStorage.getItem('email');
            if (email) {
                const fetchedFollowers = await getFollow(email);
                setFollowers(fetchedFollowers.data.followersList);
            }
        }
        
    };

    const goToBlog = (userName: string, userEmail: string) => {
        sessionStorage.setItem('other_email', userEmail);
        navigate(`/${userName}`);
    };
    const followUsers = async(email:string)=>{
        try{
          const result = await followUser({email:email});
          if(result) {
            alert('팔로우 추가에 성공했습니다!');
            fetchFollowers();
          };
        }catch(err){
          alert('팔로우 추가에 실패했습니다! 다시 시도해주세요.');
        }
        
      };
    const deleteFollowers = async (email: string) => {
        try {
            if (email) {
                const fetchedFollowers = await deleteFollow(email);
                if (fetchedFollowers) {
                    alert('팔로워를 취소했습니다!');
                    setIsModalOpen(false);
                    fetchFollowers();
                } else {
                    alert('팔로워 취소에 실패했습니다! 다시 시도해주세요.');
                }
            }
        } catch (error) {
            console.error('Failed to delete follow:', error);
        }
    };

    useEffect(() => {
        fetchFollowers();
        const email = sessionStorage.getItem('email');
        setLocalEmail(email);
    }, [navigate]);

    const handleDelete = (nicknameToDelete: string) => {
        setNicknameToDelete(nicknameToDelete);
        setIsModalOpen(true);
    };

    return (
        <div className="modal-overlay2" onClick={onClose}>
            <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close2" onClick={onClose}>&times;</span>
                <h1 style={{ color: "#FF88D7" }}>{nickname}의 팔로워</h1>
                <div className="border">
                    <div>
                        {followers.length > 0 ? (
                            <div className="followers-list">
                                {followers.map((follower, index) => (
                                  
                                    <div
                                        key={follower.user_nickname}
                                        className="follower-item"
                                        onMouseEnter={() => setHoveredFollower(follower.user_nickname)}
                                        onMouseLeave={() => setHoveredFollower(null)}
                                    >
                                        <div className="follower-image-wrapper">
                                            <img
                                                src={follower.user_image || mainCharacterImg}
                                                alt="Profile"
                                                className="heart"
                                                onClick={() => goToBlog(follower.user_nickname, follower.user_email)}
                                            />
                                            {/* <img
                                                src={deleteFollowImg}
                                                className="delete-button"
                                                onClick={() => handleDelete(follower.user_nickname)}
                                            /> */}
                                             {follower.areYouFollowing===1 &&follower.areYouFollowed===1 && (
                    
                                                <div
                                                    className="both-friend-wrapper-follower">
                                                    <img
                                                      src={bothFriendImg}
                                                      className="both-friend"
                                                      alt="Both Friend"
                                                    />
                                                </div>
                  


                                             )}
                                             
                                              { (follower.user_email !== localEmail) &&follower.areYouFollowing===1 && (//다른 사람 블로그의 팔로우 목록에서 내가 팔로우한 사람일 경우
                                                     <button onClick={()=>{deleteFollowers(follower.user_email)}}
                                                     className="both-friend-wrapper-dofollow">
                                                     <img
                                                       src={friendImg}
                                                       className="friend"
                                                       alt="friend"
                                                     />
                                                    </button>
                                              )}

                                              
                                              {  (follower.user_email !== localEmail) &&follower.areYouFollowing===0 && ( //다른 사람 블로그의 팔로우 목록에서 내가 팔로우한적 없는 사람일 경우
                                                     <button onClick={()=>{followUsers(follower.user_email)}}
                                                     className="both-friend-wrapper-dontfollow">
                                                     <img
                                                       src={nonFriendImg}
                                                       className="friend"
                                                       alt="friend"
                                                     />
                                                    </button>
                                              )}
                                            <FollowDeleteModal
                                                isOpen={isModalOpen}
                                                onClose={() => setIsModalOpen(false)}
                                                onConfirm={() => deleteFollowers(follower.user_email)}
                                                message="해당 팔로워를 삭제하시겠습니까?"
                                            />
                                        </div>
                                        <div
                                            style={{ fontWeight: 'bold', fontSize: '12px',cursor:'pointer' }}
                                            onClick={() => goToBlog(follower.user_nickname, follower.user_email)}
                                        >
                                            {follower.user_nickname}
                                        </div>
                                        {!isOthers &&hoveredFollower === follower.user_nickname && (
                                            <div>
                                                {follower.areYouFollowing ? (
                                                    <div className="hover-message">내가 팔로우하는 사용자입니다!</div>
                                                ) : (
                                                    <div className="hover-message">내가 팔로우하지 않는 사용자입니다!</div>
                                                )}
                                            </div>
                                        )}
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
    );
};

export default Follower;
