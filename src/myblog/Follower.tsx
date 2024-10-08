import React, { useEffect, useState,useRef,useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getFollow } from '../services/getService';
import { deleteFollow } from '../services/deleteService';
import mainCharacterImg from '../img/main_character.png';
import deleteFollowImg from '../img/deleteFollow.png';
import { followUser } from '../services/postService';
import './Follow.css';
import spinner from '../img/Spinner.png';
import FollowDeleteModal from './FollowDeleteModal'; 
import bothFriendImg from '../img/both_friend.png';
import friendImg from '../img/friend.png';
import nonFriendImg from '../img/nonFriend.png';
import { set } from 'date-fns';
import noPosts from '../img/noPosts.png';

interface FollowModalProps {
    onClose: () => void;
    isOthers?: boolean
    otherEmail? : string 
    profileNickname?: string
}

const Follower: React.FC<FollowModalProps> = ({ onClose ,profileNickname,isOthers,otherEmail}) => {
    const { nickname } = useParams();
    const [token, setToken] = useState<string>('');
    const [followers, setFollowers] = useState<any[]>([]);
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [nicknameToDelete, setNicknameToDelete] = useState('');
    const [localEmail, setLocalEmail] = useState('');
    const [loading, setLoading] = useState<boolean>(true);
    const [useEmail, setUseEmail] = useState('');
    const [hoveredFollower, setHoveredFollower] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef<IntersectionObserver | null>(null);
    const fetchFollowers = async () => {
        setIsLoading(true);
        try {
          //setLoading(true);
          if (otherEmail) {
            const fetchedFollowers = await getFollow(otherEmail, page);
            setFollowers(prevFollowers => [...prevFollowers, ...fetchedFollowers.data.followersList]);
      
            if (fetchedFollowers.data.followingsList.length < 10) {
              setHasMore(false);
            }
          }else{
            const fetchedFollowers = await getFollow(localEmail, page);

            setFollowers(prevFollowers => [...prevFollowers, ...fetchedFollowers.data.followingsList]);
      
            if (fetchedFollowers.data.followingsList.length < 10) {
              setHasMore(false);
            }
          }
        } catch (error) {
          console.error('Failed to load followers:', error);
          if(error.response) alert(`팔로워 목록 조회에 실패했습니다: ${error.response.data.message}`); 
        } finally {
          setIsLoading(false);
          //setLoading(false);
        }
      };
    

    const goToBlog = (userName: string, userEmail: string) => {
       
        navigate(`/${userName}`);
    };
    const followUsers = async(email:string)=>{
        try{
          const result = await followUser({email:email});
          if(result) {
            alert('팔로우 추가에 성공했습니다!');
            setFollowers(prevFollowers =>
              prevFollowers.map(follower =>
                  follower.user_email === email
                      ? { ...follower, areYouFollowing: 1 } // 팔로우 상태로 업데이트
                      : follower
              )
          );
            //fetchFollowers();
          };
        }catch(err){
          if(err.response) alert(`팔로우 추가에 실패했습니다: ${err.response.data.message}`); 
         
        }
        
      };
      const lastFollowerElementRef = useCallback(node => {
        if (isLoading) return;
        if (observer.current) observer.current.disconnect();
      
        observer.current = new IntersectionObserver(entries => {
          if (entries[0].isIntersecting && hasMore) {
            setPage(prevPage => prevPage + 1);
          }
        },
        {threshold:1.0}
      );
      
        if (node) observer.current.observe(node);
      }, [isLoading, hasMore]);
    const deleteFollowers = async (email: string) => {
        try {
            if (email) {
                const fetchedFollowers = await deleteFollow(email);
                if (fetchedFollowers) {
                    alert('팔로워를 취소했습니다!');
                    setIsModalOpen(false);
                    // fetchFollowers();
                    // 상태 업데이트: 팔로우를 취소한 유저의 팔로우 상태 변경
                    setFollowers(prevFollowers =>
                      prevFollowers.map(follower =>
                          follower.user_email === email
                              ? { ...follower, areYouFollowing: 0 } // 팔로우 취소 상태로 업데이트
                              : follower
                      )
                  );
                } else {
                    alert('팔로워 취소에 실패했습니다! 다시 시도해주세요.');
                }
            }
        } catch (error) {
            console.error('Failed to delete follow:', error);
            if(error.response) alert(`팔로워 삭제에 실패했습니다: ${error.response.data.message}`); 
        }
    };

    useEffect(() => {
      if(useEmail ==='')return;
       // 다른 사람의 블로그로 넘어갈 때 팔로워 리스트와 페이지 초기화
       setFollowers([]); // 기존 팔로워 리스트 초기화
       setPage(1); // 페이지 초기화
        fetchFollowers();
    }, [useEmail]); 

    useEffect(() => {
      if (page === 1) return; // 페이지 1에서는 이미 호출되었으므로 중복 호출 방지
      fetchFollowers();
  }, [page, navigate]); 
  
    useEffect(() => {

      const localNickname  = sessionStorage.getItem('nickname');
      const email = sessionStorage.getItem('email');
      setLocalEmail(email);
      if(nickname === localNickname) {
          setUseEmail(email);
      }else{
          setUseEmail(otherEmail);
      }
      const localStorageToken = sessionStorage.getItem('accessToken');

      if(localStorageToken ===null){
        setToken('');
      }else{
        setToken(localStorageToken);
      }
  }, []);
    const handleDelete = (nicknameToDelete: string) => {
        setNicknameToDelete(nicknameToDelete);
        setIsModalOpen(true);
    };

    return (
        <div className="modal-overlay2" onClick={onClose}>
          <div className="modal-content2" onClick={(e) => e.stopPropagation()}>
            <span className="modal-close2" onClick={onClose}>
              &times;
            </span>
            <h2 style={{ color: "#FF88D7" }}>{profileNickname}의 팔로워</h2>
            <div className="border">
              <div>
             
                  <div className="followers-list">
      

                      {followers.length === 0 ? (
                        <div >
                        <img src={noPosts} alt="No posts" className="no-posts-icon" />
                        <p>팔로워가 없습니다.</p>
                      </div>
                      ):(
                        <>
                        {followers.map((follower, index) => {
                    if (followers.length === index + 1) {
                      return (
                        <div
                          ref={lastFollowerElementRef}
                          key={follower.user_nickname}
                          className="follower-item"
                          onMouseEnter={() =>
                            setHoveredFollower(follower.user_nickname)
                          }
                          onMouseLeave={() => setHoveredFollower(null)}
                        >
                          <div className="follower-image-wrapper">
                            <img
                              src={follower.user_image || mainCharacterImg}
                              alt="Profile"
                              className="heart-no-spin"
                              onClick={() =>
                                goToBlog(follower.user_nickname, follower.user_email)
                              }
                            />
                            {follower.areYouFollowing === 1 &&token &&
                              follower.areYouFollowed === 1 && (
                                <div className="both-friend-wrapper-follower">
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
                              message="해당 팔로워를 삭제하시겠습니까?"
                            />
                          </div>
                          <div
                            style={{
                              maxWidth:'50px',
                              fontWeight: "bold",
                              fontSize: "12px",
                              cursor: "pointer",
                              overflow:'hidden',
                              whiteSpace: 'nowrap', // 한 줄로 표시
                              textOverflow: 'ellipsis', // 길면 점점점 표시
                            }}
                            onClick={() =>
                              goToBlog(follower.user_nickname, follower.user_email)
                            }
                          >
                            {follower.user_nickname}
                          </div>
                          {follower.user_email !== localEmail &&token &&
                            follower.areYouFollowing === 1 && (
                              <button
                                onClick={() => deleteFollowers(follower.user_email)}
                                className="both-friend-wrapper-dofollow"
                              >
                                <img
                                  src={friendImg}
                                  className="friend"
                                  alt="friend"
                                />
                              </button>
                            )}
    
                          {follower.user_email !== localEmail &&token &&
                            follower.areYouFollowing === 0 && (
                              <button
                                onClick={() => followUsers(follower.user_email)}
                                className="both-friend-wrapper-dontfollow"
                              >
                                <img
                                  src={nonFriendImg}
                                  className="friend"
                                  alt="friend"
                                />
                              </button>
                            )}
                          {!isOthers &&
                            hoveredFollower === follower.user_nickname && (
                              <div>
                                {follower.areYouFollowing ? (
                                  <div className="hover-message">
                                    내가 팔로우하는 사용자입니다!
                                  </div>
                                ) : (
                                  <div className="hover-message">
                                    내가 팔로우하지 않는 사용자입니다!
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    } else {
                      return (
                        <div
                          key={follower.user_nickname}
                          className="follower-item"
                          onMouseEnter={() =>
                            setHoveredFollower(follower.user_nickname)
                          }
                          onMouseLeave={() => setHoveredFollower(null)}
                        >
                          <div className="follower-image-wrapper">
                            <img
                              src={follower.user_image || mainCharacterImg}
                              alt="Profile"
                              className="heart-no-spin"
                              onClick={() =>
                                goToBlog(follower.user_nickname, follower.user_email)
                              }
                            />

                            
                            {follower.areYouFollowing === 1 &&token &&
                              follower.areYouFollowed === 1 && (
                                <div className="both-friend-wrapper-follower">
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
                              message="해당 팔로워를 삭제하시겠습니까?"
                            />
                          </div>
                          <div
                            style={{
                             
                              fontWeight: "bold",
                              fontSize: "12px",
                              cursor: "pointer",
                              maxWidth:'50px',
                              overflow:'hidden',
                              whiteSpace: 'nowrap', // 한 줄로 표시
                              textOverflow: 'ellipsis', // 길면 점점점 표시
                            }}
                            onClick={() =>
                              goToBlog(follower.user_nickname, follower.user_email)
                            }
                          >
                            {follower.user_nickname}
                          </div>
                          {follower.user_email !== localEmail &&token &&
                            follower.areYouFollowing === 1 && (
                              <button
                                onClick={() => deleteFollowers(follower.user_email)}
                                className="both-friend-wrapper-dofollow"
                              >
                                <img
                                  src={friendImg}
                                  className="friend"
                                  alt="friend"
                                />
                              </button>
                            )}
    
                          {follower.user_email !== localEmail &&token &&
                            follower.areYouFollowing === 0 && (
                              <button
                                onClick={() => followUsers(follower.user_email)}
                                className="both-friend-wrapper-dontfollow"
                              >
                                <img
                                  src={nonFriendImg}
                                  className="friend"
                                  alt="friend"
                                />
                              </button>
                            )}
                          {!isOthers &&
                            hoveredFollower === follower.user_nickname && (
                              <div>
                                {follower.areYouFollowing ? (
                                  <div className="hover-message">
                                    내가 팔로우하는 사용자입니다!
                                  </div>
                                ) : (
                                  <div className="hover-message">
                                    내가 팔로우하지 않는 사용자입니다!
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                      );
                    }
                  })}
                      </>
                      )}

             
                  </div>
            
              </div>
            </div>
          </div>
        </div>
      );
      
};

export default Follower;
