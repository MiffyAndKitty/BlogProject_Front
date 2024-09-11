import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useRef } from 'react';
import { useParams,Link  } from 'react-router-dom';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import SearchBar from '../structure/SearchBar';
import spinner from '../img/Spinner.png';
import './PopularTags.css';
import '../myblog/ManagePost/GetPost.css';
import * as TYPES from '../types/index';
import mainCharacterImg from '../img/main_character.png';
import Profile from '../main/Profile';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import { getALLPosts,getCategories } from '../services/getService';
import { deletePost } from '../services/deleteService';
import { useNavigate } from 'react-router-dom';
import PostDetail from '../myblog/PostDetail';
import filledCarrot from '../img/filledCarrot.png'
import CategorySettings from '../myblog/CategorySetting';
import ConfirmModal from '../myblog/ConfirmModal'; 
import SSEComponent from './SSEComponent';
import  upBtn  from '../img/upToggle.png';
import  downBtn  from '../img/downToggle.png';
import noPosts from '../img/noPosts.png';
import { set } from 'date-fns';

const AllPopularPost: React.FC = () => {
  let {  postID , tag, search, sort} = useParams<{ postID?: string, tag?:string, search?:string, sort?:string }>();
  const location = useLocation();
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [localNickName, setLocalNickName] = useState<string>('');
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  const [sortOption, setSortOption] = useState(''); // 정렬 옵션 상태 추가
  
  const pageSize = 10;
  // const [filteredPosts, setFilteredPosts] = useState<TYPES.getPost[]>([]);
  const navigate = useNavigate();

  const fixPost = (postID: string) => {
    if (isWriter === true) navigate(`/fixpost/${nickname}`, { state: { postID } });
    else alert('수정권한이 없습니다!');
  };

  const formatDate = (dateString: string): string => {
    const inputDate = new Date(dateString); // 입력된 ISO 형식의 날짜를 Date 객체로 변환
    const currentDate = new Date(); // 현재 시간을 Date 객체로 가져오기
    const adjustedCurrentDate = new Date(currentDate.getTime() + 9 * 60 * 60 * 1000);
  
    // 두 날짜의 차이를 밀리초로 계산
    const timeDifference = adjustedCurrentDate.getTime() - inputDate.getTime();
  
    // 밀리초를 시간, 일, 주 단위로 변환
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = 1000 * 60;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInDay = millisecondsInHour * 24;
    const millisecondsInWeek = millisecondsInDay * 7;
  
  
    if (timeDifference < millisecondsInMinute) {
      // 1분 미만인 경우 (N초 전으로 표시)
      const secondsDifference = Math.floor(timeDifference / millisecondsInSecond);
      return `${secondsDifference}초 전`;
    }
    else if (timeDifference < millisecondsInHour) {
      // 1시간 미만인 경우 (N분 전으로 표시)
      const minutesDifference = Math.floor(timeDifference / millisecondsInMinute);
      return `${minutesDifference}분 전`;
    } 
    else if (timeDifference < millisecondsInDay) {
      // 하루가 지나지 않은 경우 (N시간 전으로 표시)
      const hoursDifference = Math.floor(timeDifference / millisecondsInHour);
      return `${hoursDifference}시간 전`;
    } else if (timeDifference < millisecondsInWeek) {
      // 하루에서 일주일 사이인 경우 (N일 전으로 표시)
      const daysDifference = Math.floor(timeDifference / millisecondsInDay);
      return `${daysDifference}일 전`;
    } else {
      let [datePart, timePart] = dateString.split('T');
      let [year, month, day] = datePart.split('-');
      let [hours, minutes, seconds] = timePart.replace('Z', '').split(':');
    
      // 초에서 소수점 제거
      seconds = seconds.split('.')[0];
    
      // 시간을 숫자로 변환
      let hourInt = parseInt(hours);
      let ampm = hourInt >= 12 ? '오후' : '오전';
    
      // 12시간제로 변환
      hourInt = hourInt % 12;
      hourInt = hourInt ? hourInt : 12; // 0이면 12로 설정
    
      const strHours = hourInt.toString().padStart(2, '0');
    
      return `${year}.${month}.${day} ${ampm} ${strHours}:${minutes}:${seconds}`;
    }
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchPosts(undefined,null, term,sortOption);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCursor(posts[0].board_id);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCursor(posts[posts.length - 1].board_id);
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
    }
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };


  /**
   * 게시글 불러오기
   */
  const fetchPosts = async (cursor?: string, categoryID?: string, query?:string,sort?:string) => {
    setLoading(true); 
    setError(null);  
    try {
      const nickname=sessionStorage.getItem('nickname');
      setNickname(nickname);
      console.log(`
        ==================
        fetchPosts Info 
        nickname:${nickname}
        cursor:${cursor}
        isBefore:${isBefore}
        categoryID:${categoryID}
        query:${query}
        +++++++++++++++++++
        `)
      const fetchedPosts = await getALLPosts(pageSize, cursor,isBefore,categoryID,query,sort,tag);
      setIsWriter(fetchedPosts.data.isWriter);
      
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content), // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
      setTotalPages(fetchedPosts.data.total.totalPageCount || 1); // 수정된 부분

      if (currentPage === 1 || currentPage === totalPages) { // 수정된 부분
        setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length - 1].board_id);
      }
    } catch (err) {
      setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 불필요한 태그 제거 함수
  const removeUnwantedTags = (html: string): string => {
    const cleanHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    const div = document.createElement('div');
    div.innerHTML = cleanHtml;
    return div.textContent || div.innerText || '';
  };


  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const localStorageToken = sessionStorage.getItem('accessToken');

    if(localStorageToken ===null){
      setToken('');
    }else{
      setToken(localStorageToken);
    }
    try{
        const localNickname = sessionStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
    }catch(err){
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
        setLocalNickName('');
    }finally {
        setLoading(false);
    }
    
    //fetchPosts();

  }, []);

  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };

  // 쿼리 스트링에서 search 및 sort 값을 추출
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const search = queryParams.get('search') || '';  // search 값을 가져옴
    const sort = queryParams.get('sort') || '';      // sort 값을 가져옴
    
    console.log(  `
      
      
      
      
      
      
      search
      
      sort
      
      
      
      
      
      `,search,sort)
    setSearchTerm(search);  // 검색어 상태 설정
    setSortOption(sort);    // 정렬 옵션 상태 설정

    fetchPosts(undefined,null, search, sort);  // 게시글 가져오기 함수 호출
  }, [location.search]);  // location.search가 변경될 때마다 실행

    useEffect(() => {

      if(currentPage !==0) {
        fetchPosts(cursor,null,searchTerm,sortOption);
      }else{
        setCurrentPage(1);
      }
      
  }, [currentPage]);

  const goToBlog = (nickname:string,email:string)=>{

    navigate(`/${nickname}`);
  };

  const goToDetailPost = (postID: string , postAthor:String)=>{
    navigate(`/${postAthor}/${postID}`, { state: { postID } });
  };

  const handleSortChange = (option) => {
    setSortOption(option);
    console.log(option)
    fetchPosts(undefined,null,searchTerm,option)
  };

  const fetchAllPost = ()=>{
    setSearchTerm('');
    setCursor('');
    setCurrentPage(1);
    setSortOption('');
    fetchPosts();  // 게시글 가져오기 함수 호출
    
  }
  return (
    <div className="App">
      <Header pageType="otherblog" hasNotifications ={hasNotifications}/>
      <main className="blog-main-container">
     
        {(!token && <Profile pageType="no-login-section" />)}
        {(token &&<Profile pageType="profileSetting" nicknameParam={localNickName}/>)}

          <section className='main-blog-posts-section'>
            {
              postID?(
                <PostDetail/>
              ) : (
                
                <> 

                
                {tag?  
                    (
                      <div className='tagTitle-all'>
                        <em className="tagTitle">#{tag}</em>
                        <h2> 전체보기</h2> 
                      </div>
                    )
                   
                   :(
                      <h2 onClick={fetchAllPost}>게시글 전체보기</h2>
                   )
                   }

                <div className="filter-buttons">
                  <button className={`tab-button ${sortOption === '' ? 'active' : ''}`} onClick={() => handleSortChange('')}>최신순</button>
                  <button className={`tab-button ${sortOption === 'like' ? 'active' : ''}`} onClick={() => handleSortChange('like')}>인기순(당근수)</button>
                  <button className={`tab-button ${sortOption === 'view' ? 'active' : ''}`} onClick={() => handleSortChange('view')}>조회순</button>
                </div>

                <div className='search-and-sort-container'>
                      <SearchBar onSearch={handleSearch} />
                </div>

                <hr className="notification-divider" />

                <div>

                {loading ?(
                  <div className="no-posts-message">
                  <div className="no-posts-container">
                  <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                    <p>로딩중...</p>
                  </div>
                </div>
                ): posts.length === 0 ?(
                  <div className="no-posts-message">
                  <div className="no-posts-container">
                    <img src={noPosts} alt="No posts" className="no-posts-icon" />
                    <p>게시물이 없습니다.</p>
                  </div>
                </div>
                ):(
                  <div className="post-main-main-list">
                  {posts.map((post) => (
                    <div className="post-main-card" key={post.board_id} onClick={() => goToDetailPost(post.board_id, post.user_nickname)}>
                      <div className="post-main-header" >
                        <div className="title-container">
                          <h2 className="post-title" dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_title, searchTerm) }}></h2>
                          <span onClick={() => goToBlog(post.user_nickname, post.user_email)} className="post-user-author" style={{cursor:'pointer'}}>{post.user_nickname}</span>
                        </div>
                        <div className="post-main-meta">
                          <span className="post-main-category">{post.category_name}</span>
                          <span className="post-main-date">{formatDate(post.created_at)}</span>
                          <span className="post-main-stats">
                           
                          <span className="post-user-nickname">조회수
                                  <span className="post-user-num"> {post.board_view}</span>
                                </span>

                                <span className="post-user-nickname">
                                  <img style={{ width: '15px', height: '15px' }} src={filledCarrot}></img> 
                                  <span className="post-user-num"> {post.board_like}</span>
                                </span>

                                <span className="post-user-nickname">댓글
                                  <span className="post-user-num"> {post.board_comment}</span>
                                </span>
                          </span>
                        </div>
                      </div>
                      <div className="post-main-content" dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_content, searchTerm) }} ></div>
                    </div>
                    ))}
                  </div>
                )}

                <div className="pagination">
                  <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                    이전
                  </button>
                  <span className="pagination-info">
                    {currentPage} / {totalPages}
                  </span>
                  <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                    다음
                  </button>
                </div>
                </div>
                </>
              )
            } 

            
          
          </section>
  
        <SSEComponent onNotification={handleNotification}></SSEComponent>
      </main>
      <Footer />
    </div>
  );
};

export default AllPopularPost;
