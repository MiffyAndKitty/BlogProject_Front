import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollow } from '../services/getService';
import { deleteFollow } from '../services/deleteService';
import mainCharacterImg from '../img/main_character.png';
import deleteFollowImg from '../img/deleteFollow.png';
import './Follow.css';
import ConfirmModal from './ConfirmModal'; 

interface FollowModalProps {
    onClose: () => void;
}

const Follow: React.FC<FollowModalProps> = ({ onClose }) => {
    const { nickname } = useParams();
    const [followers, setFollowers] = useState<any[]>([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nicknameToDelete, setNicknameToDelete] = useState('');
    const [hoveredFollower, setHoveredFollower] = useState<string | null>(null);

    const fetchFollowers = async () => {
        const email = sessionStorage.getItem('email');
        if (email) {
            const fetchedFollowers = await getFollow(email);
            setFollowers(fetchedFollowers.data.followingsList);
        }
    };

    const goToBlog = (userName: string, userEmail: string) => {
        sessionStorage.setItem('other_email', userEmail);
        navigate(`/${userName}`);
    };

    const deleteFollowers = async (email: string) => {
        try {
            if (email) {
                const fetchedFollowers = await deleteFollow(email);
                if (fetchedFollowers) {
                    alert('팔로우를 취소했습니다!');
                    setIsModalOpen(false);
                    fetchFollowers();
                } else {
                    alert('팔로우 취소에 실패했습니다! 다시 시도해주세요.');
                }
            }
        } catch (error) {
            console.error('Failed to delete follow:', error);
        }
    };

    useEffect(() => {
        fetchFollowers();
    }, [navigate]);

    const handleDelete = (nicknameToDelete: string) => {
        setNicknameToDelete(nicknameToDelete);
        setIsModalOpen(true);
    };

    return (
        <div className="modal-overlay2" onClick={onClose}>
            <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close2" onClick={onClose}>&times;</span>
                <h1 style={{ color: "#FF88D7" }}>{nickname}의 팔로우</h1>
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
                                                onClick={() => navigate(`/${follower.user_nickname}`)}
                                            />
                                            <img
                                                src={deleteFollowImg}
                                                className="delete-button"
                                                onClick={() => handleDelete(follower.user_nickname)}
                                            />
                                            <ConfirmModal
                                                isOpen={isModalOpen}
                                                onClose={() => setIsModalOpen(false)}
                                                onConfirm={() => deleteFollowers(follower.user_email)}
                                                message="해당 팔로우를 삭제하시겠습니까?"
                                            />
                                        </div>
                                        <div
                                            style={{ fontWeight: 'bold', fontSize: '12px' }}
                                            onClick={() => goToBlog(follower.user_nickname, follower.user_email)}
                                        >
                                            {follower.user_nickname}
                                        </div>
                                        {hoveredFollower === follower.user_nickname && (
                                            <div>
                                                {follower.areYouFollowed ? (
                                                    <div className="hover-message">나를 팔로우하는 사용자입니다!</div>
                                                ) : (
                                                    <div className="hover-message">나를 팔로우하지 않는 사용자입니다!</div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p>팔로우가 없습니다.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Follow;
