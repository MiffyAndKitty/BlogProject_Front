import React, { useEffect, useState ,useRef,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollow } from '../services/getService';
import { deleteFollow } from '../services/deleteService';
import { followUser } from '../services/postService';
import mainCharacterImg from '../img/main_character.png';
import deleteFollowImg from '../img/deleteFollow.png';
import './Follow.css';
import FollowDeleteModal from './FollowDeleteModal'; 
import bothFriendImg from '../img/both_friend.png';
import friendImg from '../img/friend.png';
import nonFriendImg from '../img/nonFriend.png';
import { set } from 'date-fns';
interface FollowModalProps {
    onClose: () => void;
    isOthers?: boolean
    otherEmail? : string 
}
const Follow: React.FC<FollowModalProps> = ({ onClose ,isOthers,otherEmail}) => {
    const { nickname } = useParams();
    const [followers, setFollowers] = useState<any[]>([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nicknameToDelete, setNicknameToDelete] = useState('');
    const [hoveredFollower, setHoveredFollower] = useState<string | null>(null);
    const [isFollow, setIsFollow] = useState(false);
    const [localEmail, setLocalEmail] = useState('');
    const [manage,setManage] = useState(false);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);

    const fetchFollowers = async () => {
        setIsLoading(true);
        try {
        
          if (otherEmail) {
            const fetchedFollowers = await getFollow(otherEmail, page);
            setFollowers(prevFollowers => [...prevFollowers, ...fetchedFollowers.data.followingsList]);
      
            if (fetchedFollowers.data.followingsList.length < 10) {
              setHasMore(false);
            }
          }
        } catch (error) {
          console.error('Failed to load followers:', error);
        } finally {
          setIsLoading(false);
        }
      };
      

    const goToBlog = (userName: string, userEmail: string) => {
        
        navigate(`/${userName}`);
    };

    const deleteFollowers = async (email:string) => {
        
        try{
            const fetchedFollowers = await deleteFollow(email);
            if(fetchedFollowers){
                alert('팔로우를 취소했습니다!')
                
                setIsModalOpen(false);
                fetchFollowers();
            } 
            else alert('팔로우 취소에 실패했습니다! 다시 시도해주세요.');
        }catch{
            
        }
       
      };
      const lastFollowerElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
      
        observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
            setPage(prevPage => prevPage + 1);
          }
        });
      
        if (node) observer.current.observe(node);
      }, [isLoading, hasMore]);
    useEffect(() => {
       //fetchFollowers();
        const email = sessionStorage.getItem('email');
        setLocalEmail(email);
    }, []);
    useEffect(() => {
        fetchFollowers();
    }, [page, navigate]); 
    const handleDelete = (nicknameToDelete: string) => {
        setNicknameToDelete(nicknameToDelete);
        setIsModalOpen(true);
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

    return (
        <div className="modal-overlay2" onClick={onClose}>
            <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
                <span className="modal-close2" onClick={onClose}>&times;</span>
                <div style={{display:'flex', flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}>
                    <h1 style={{ color: "#FF88D7" }}>{nickname}의 팔로우</h1>
                    {!isOthers && !manage && (<button style={{height:'30px',backgroundColor: '#ff4da6',color: 'white',padding: '10px 20px', border: 'none',borderRadius: '5px'}} onClick={()=>{setManage(true)}}>관리하기</button>)}
                    {!isOthers && manage && (<button style={{height:'30px',backgroundColor: 'grey',color: 'white',padding: '10px 20px', border: 'none',borderRadius: '5px'}}   onClick={()=>{setManage(false)}}>관리 끝내기</button>)}
                </div>
                

                <div className="border">
                    <div>
                        {followers.length > 0 ? (
                            <div className="followers-list">
                                {followers.map((follower, index) => {
                                    if(followers.length === index + 1) {
                                        return(
                                            <div
                                            ref={lastFollowerElementRef}
                                            key={follower.following_id}
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
                                                {(manage&&follower.user_email !== localEmail) &&!isOthers &&(
                                                    <img
                                                    src={deleteFollowImg}
                                                    className="delete-button"
                                                    onClick={() => handleDelete(follower.user_nickname)}
                                                />
                                                )}
                                               
                                                 {isOthers&& follower.areYouFollowing===1 &&follower.areYouFollowed===1 && (
                        
                                                    <div
                                                        className="both-friend-wrapper-follower">
                                                        <img
                                                          src={bothFriendImg}
                                                          className="both-friend"
                                                          alt="Both Friend"
                                                        />
                                                    </div>
                      
    
    
                                                 )}
                                                {!isOthers&& follower.areYouFollowing===1 &&follower.areYouFollowed===1 && (
    
                                                    <div
                                                        className="both-friend-wrapper">
                                                        <img
                                                          src={bothFriendImg}
                                                          className="both-friend"
                                                          alt="Both Friend"
                                                        />
                                                    </div>
    
                                                
                                                
                                                 )}
                                                 
                                                <FollowDeleteModal
                                                    isOpen={isModalOpen}
                                                    onClose={() => setIsModalOpen(false)}
                                                    onConfirm={() => deleteFollowers(follower.user_email)}
                                                    message="해당 팔로우를 삭제하시겠습니까?"
                                                />
                                            </div>
    
                                            <div
                                                style={{ fontWeight: 'bold', fontSize: '12px', cursor:'pointer' }}
                                                onClick={() => goToBlog(follower.user_nickname, follower.user_email)}
                                            >
                                                {follower.user_nickname}
                                            </div>
                                            {(follower.user_email !== localEmail) &&isOthers && follower.areYouFollowing===1 && (//다른 사람 블로그의 팔로우 목록에서 내가 팔로우한 사람일 경우
                                                         <button onClick={()=>{deleteFollowers(follower.user_email)}}
                                                         className="both-friend-wrapper-dofollow">
                                                         <img
                                                           src={friendImg}
                                                           className="friend"
                                                           alt="friend"
                                                         />
                                                        </button>
                                                  )}
    
                                                  
                                                  {(follower.user_email !== localEmail) &&isOthers && follower.areYouFollowing===0 && ( //다른 사람 블로그의 팔로우 목록에서 내가 팔로우한적 없는 사람일 경우
                                                         <button onClick={()=>{followUsers(follower.user_email)}}
                                                         className="both-friend-wrapper-dontfollow">
                                                         <img
                                                           src={nonFriendImg}
                                                           className="friend"
                                                           alt="friend"
                                                         />
                                                        </button>
                                                  )}
                                            {!isOthers &&hoveredFollower === follower.user_nickname && (
                                                <div>
                                                    {follower.areYouFollowed ? (
                                                        <div className="hover-message">나를 팔로우하는 사용자입니다!</div>
                                                    ) : (
                                                        <div className="hover-message">나를 팔로우하지 않는 사용자입니다!</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        );
                                    }else{
                                        return(
                                            <div
                                            key={follower.following_id}
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
                                                {(manage&&follower.user_email !== localEmail) &&!isOthers &&(
                                                    <img
                                                    src={deleteFollowImg}
                                                    className="delete-button"
                                                    onClick={() => handleDelete(follower.user_nickname)}
                                                />
                                                )}
                                               
                                                 {isOthers&& follower.areYouFollowing===1 &&follower.areYouFollowed===1 && (
                        
                                                    <div
                                                        className="both-friend-wrapper-follower">
                                                        <img
                                                          src={bothFriendImg}
                                                          className="both-friend"
                                                          alt="Both Friend"
                                                        />
                                                    </div>
                      
    
    
                                                 )}
                                                {!isOthers&& follower.areYouFollowing===1 &&follower.areYouFollowed===1 && (
    
                                                    <div
                                                        className="both-friend-wrapper">
                                                        <img
                                                          src={bothFriendImg}
                                                          className="both-friend"
                                                          alt="Both Friend"
                                                        />
                                                    </div>
    
                                                
                                                
                                                 )}
                                                 
                                                <FollowDeleteModal
                                                    isOpen={isModalOpen}
                                                    onClose={() => setIsModalOpen(false)}
                                                    onConfirm={() => deleteFollowers(follower.user_email)}
                                                    message="해당 팔로우를 삭제하시겠습니까?"
                                                />
                                            </div>
    
                                            <div
                                                style={{ fontWeight: 'bold', fontSize: '12px', cursor:'pointer' }}
                                                onClick={() => goToBlog(follower.user_nickname, follower.user_email)}
                                            >
                                                {follower.user_nickname}
                                            </div>
                                            {(follower.user_email !== localEmail) &&isOthers && follower.areYouFollowing===1 && (//다른 사람 블로그의 팔로우 목록에서 내가 팔로우한 사람일 경우
                                                         <button onClick={()=>{deleteFollowers(follower.user_email)}}
                                                         className="both-friend-wrapper-dofollow">
                                                         <img
                                                           src={friendImg}
                                                           className="friend"
                                                           alt="friend"
                                                         />
                                                        </button>
                                                  )}
    
                                                  
                                                  {(follower.user_email !== localEmail) &&isOthers && follower.areYouFollowing===0 && ( //다른 사람 블로그의 팔로우 목록에서 내가 팔로우한적 없는 사람일 경우
                                                         <button onClick={()=>{followUsers(follower.user_email)}}
                                                         className="both-friend-wrapper-dontfollow">
                                                         <img
                                                           src={nonFriendImg}
                                                           className="friend"
                                                           alt="friend"
                                                         />
                                                        </button>
                                                  )}
                                            {!isOthers &&hoveredFollower === follower.user_nickname && (
                                                <div>
                                                    {follower.areYouFollowed ? (
                                                        <div className="hover-message">나를 팔로우하는 사용자입니다!</div>
                                                    ) : (
                                                        <div className="hover-message">나를 팔로우하지 않는 사용자입니다!</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        );
                                    }
                                }
                                    
                                )}
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
