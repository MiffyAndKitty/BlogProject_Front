import React, { useState, useEffect,useRef } from 'react';
import './MainPosts.css';
import * as TYPES from '../types/index';
import mainCharacterImg from '../img/main_character.png';
import { getPosts,getCategories } from '../services/getService';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import { Link, useNavigate } from "react-router-dom";
import SearchBar from '../structure/SearchBar';
import filledCarrot from '../img/filledCarrot.png';
import  upBtn  from '../img/upToggle.png';
import  downBtn  from '../img/downToggle.png';
import noPosts from '../img/noPosts.png';
interface MainPostsProps {
  nicknameParam : string
  categoryID : string
  onPostClick: (postID: string) => void;  // 새로운 prop 추가
}
const MainPosts: React.FC<MainPostsProps>  = ({nicknameParam,categoryID,onPostClick} ) => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categories, setCategories] = useState<TYPES.categories[]>();
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [sortOption, setSortOption] = useState(''); // 정렬 옵션 상태 추가
  const [sortName, setSortName] = useState('최신순'); // 정렬 이름 상태 추가
  const [sortedPosts, setSortedPosts] = useState(posts); // 정렬된 포스트 상태 추가
  const navigate = useNavigate();

  const fixPost = (postID: string) => {
    if(isWriter === true) navigate(`/fixpost/${nickname}`, { state: { postID } });
    else alert("수정권한이 없습니다!");
    
  };
  const handleSortChange = (option, name) => {
    setSortOption(option);
    setDropdownOpen(false); // 드롭다운을 닫음
    setSortName(name);
    console.log(option)
  };
  /**
   * 날짜 문자열을 원하는 형식으로 변환하는 함수
   * @param dateString - ISO 형식의 날짜 문자열
   * @returns 변환된 날짜 문자열
   */
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



    // 주어진 카테고리 ID를 찾기 위한 재귀 함수
   const findCategoryById = (categories: TYPES.categories[], categoryId: string) => {

    for (const category of categories) {
      if (category.category_id === categoryId) {
        return category.category_name ;
      }
      if (category.subcategories) {
        const foundCategory = findCategoryById(category.subcategories, categoryId);
        if (foundCategory) {
          return foundCategory;
        }
      }
    }
    return '';
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
  // 불필요한 태그 제거 함수 (이미지 태그는 유지)
  const removeUnwantedTags = (html: string): string => {
    // 이미지 태그를 허용하면서 나머지 태그를 제거하도록 설정
    const cleanHtml = DOMPurify.sanitize(html, { 
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'img'], // 허용할 태그들 (img 포함)
      ALLOWED_ATTR: ['src', 'alt', 'title', 'width', 'height'], // 허용할 속성들
    });
    return cleanHtml;
  };


  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCurrentPage(1);
    fetchPosts(undefined,null, term);
  };

  const extractFirstImage = (htmlContent: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const firstImage = doc.querySelector('img'); // 첫 번째 이미지를 선택
    
    return firstImage ? firstImage.outerHTML : null; // 이미지가 있으면 HTML 태그를 반환, 없으면 null 반환
  };
  const fetchPosts = async (cursor?: string, categoryID?: string, query?: string, sort?:string) => {
    setLoading(true); 
    setError(null);  
  
    try {
      const nickname = sessionStorage.getItem('nickname');
      setNickname(nickname);
  
      const fetchedPosts = await getPosts(nicknameParam, cursor, isBefore, categoryID, query,sort);
      setIsWriter(fetchedPosts.data.isWriter);
  
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content),
      }));
  
      setPosts(postsWithCleanContent);
  
      setTotalPages(fetchedPosts.data.total.totalPageCount || 1); // 수정된 부분
  
      if (currentPage === 1 || currentPage === totalPages) { // 수정된 부분
        setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length - 1].board_id);
      }
  
      const fetchedCategories: any = await getCategories(nicknameParam);
      setCategories(fetchedCategories.hierarchicalCategory);
    } catch (err) {
      setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  

  const goToDetailPost = (postID: string)=>{
    navigate(`/${nicknameParam}/${postID}`, { state: { postID } });
  }

  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    fetchPosts();
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect (()=>{
    setCurrentPage(1);
    setSearchTerm('');
    setCursor('');
    fetchPosts(undefined,  categoryID,searchTerm);
  },[categoryID]);

  useEffect(() => {
    fetchPosts(cursor,categoryID,searchTerm,sortOption);
  }, [currentPage]);
  useEffect(()=>{
    setSearchTerm('');
    setCurrentPage(1);
    setCursor('');
    fetchPosts(undefined,categoryID,undefined,sortOption);
  },[sortOption])
  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };

  return (
    <>
      
              <h1>{nicknameParam}의 블로그</h1>
              {loading ? (
                <div className="no-posts-message">
                  <div className="no-posts-container">
                    <p>로딩중...</p>
                  </div>
                </div>
              ) : posts.length === 0 ? (
                <div className="no-posts-message">
                  <div className="no-posts-container">
                    <img src={noPosts} alt="No posts" className="no-posts-icon" />
                    <p>게시물이 없습니다.</p>
                  </div>
                </div>
              ) : (
                <>
                  <div className="search-and-sort-container">
                    <SearchBar onSearch={handleSearch} />
                    <div className="dropdown-getpost" ref={dropdownRef} style={{ width: '300px', marginRight: '-200px', fontWeight: 'bold' }}>
                      <button className="dropdown-getpost-toggle" style={{ fontWeight: 'bold' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                        {sortName} {dropdownOpen ? <img src={upBtn} style={{ width: '15px', height: '15px' }} /> : <img src={downBtn} style={{ width: '15px', height: '15px' }} />}
                      </button>
                      {dropdownOpen && (
                        <div className="dropdown-menu">
                          <button className="dropdown-item" onClick={() => handleSortChange('', '최신순')}>최신순</button>
                          <button className="dropdown-item" onClick={() => handleSortChange('like', '인기순(당근수)')}>인기순(당근수)</button>
                          <button className="dropdown-item" onClick={() => handleSortChange('view', '조회순')}>조회순</button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '15px' }} className="post-main-main-list">
                    {posts.map(post => {
                      const firstImage = extractFirstImage(post.board_content);
                      
                      return (
                        <div className="post-main-card" key={post.board_id}>
                          <div className="post-main-header">
                            <div className="title-container">
                              <h2 className="post-title" dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_title, searchTerm) }}></h2>
                              <span className="user-nickname">{post.user_nickname}</span>
                            </div>
                            
                            <div className="post-main-meta">
                              <span className="post-main-category">{findCategoryById(categories, post.category_id)}</span>
                              <span className="post-main-date">{formatDate(post.created_at)}</span>
                              <span className="post-main-stats">
                                <span className="user-nickname">조회수: {post.board_view}</span>
                                <span className="user-nickname"><img style={{ width: '15px', height: '15px' }} src={filledCarrot}></img> : {post.board_like}</span>
                                <span className="user-nickname">댓글: {post.board_comment}</span>
                              </span>
                            </div>
                          </div>
                          
                          <div className="post-main-content" onClick={() => goToDetailPost(post.board_id)}>
                            {firstImage ? (
                              <div dangerouslySetInnerHTML={{ __html: firstImage }} className="first-image-content"></div>
                            ) : (
                              <div dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_content, searchTerm) }}></div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            

              <div className="pagination">
                <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>이전</button>
                <span className="pagination-info">{currentPage} / {totalPages}</span>
                <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>다음</button>
              </div>
        
    </>
  );
};

export default MainPosts;
