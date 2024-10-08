import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import SearchBar from '../../structure/SearchBar';
import './GetPost.css';
import * as TYPES from '../../types/index';
import mainCharacterImg from '../../img/main_character.png';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import { getPosts,getCategories } from '../../services/getService';
import { deletePost } from '../../services/deleteService';
import { useNavigate } from 'react-router-dom';
import CategorySettings from '../CategorySetting';
import filledCarrot from '../../img/filledCarrot.png';
import ConfirmModal from '../ConfirmModal'; 
import Profile from '../../main/Profile';
import SSEComponent from '../../main/SSEComponent';
import spinner from '../../img/Spinner.png';
import noPosts from '../../img/noPosts.png';
import  upBtn  from '../../img/upToggle.png';
import  downBtn  from '../../img/downToggle.png';
import previous from '../../img/previous.png';
import next from '../../img/next.png';
import fastPrevious from '../../img/fast_previous.png';
import fastNext from '../../img/fast_next.png';
import { QuestionMark } from '../../resource/QuestionMark';

const GetPost: React.FC = () => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [categories, setCategories] = useState<TYPES.categories[]>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [page, setPage] = useState(0);
  const [managementType, setManagementType] = useState<'post' | 'category'>('post');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [category, setCategory] = useState<TYPES.category>({category_name:'카테고리 설정', category_id:""});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  // const [filteredPosts, setFilteredPosts] = useState<TYPES.getPost[]>([]);
  const navigate = useNavigate();

  const fixPost = (postID: string) => {
    if (isWriter === true) navigate(`/fixpost/${postID}`);
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
  const goToFirstPage = () =>{
    setPage(Math.abs(currentPage - 1));
    setCursor(posts[0].board_id);
    setIsBefore(true);
    setCurrentPage(1);
    //fetchPosts(undefined,null, search, sort);  // 게시글 가져오기 함수 호출
  };
  const goToLastPage = () =>{

    setCursor(posts[posts.length - 1].board_id);
    setPage(totalPages-currentPage);
    setCurrentPage(totalPages);
    setIsBefore(false);
    //fetchPosts(cursor,null,searchTerm,sortOption);
  };
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCursor(posts[0].board_id);
      setPage(1);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCursor(posts[posts.length - 1].board_id);
      setPage(1);
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
    }
  };
  const goToPage = (page:number)=>{
    if(currentPage - page >0){
      setCursor(posts[0].board_id);
      setIsBefore(true);
    }else{
      setCursor(posts[posts.length - 1].board_id);
      setIsBefore(false);
    }
    setPage(Math.abs(currentPage - page));
    setCurrentPage(page);
  };

   // renderPages 함수 수정: 현재 페이지를 중심으로 5개의 페이지를 반환
  const renderPages = (currentPage: number, totalPages: number) => {
    let pages = [];
    const startPage = Math.max(currentPage - 2, 1);
    const endPage = Math.min(startPage + 4, totalPages);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setCursor('');
    setCurrentPage(1);
    fetchPosts(undefined,category.category_id, term);
  };


  const goToDetailPost = (postID: string)=>{
    navigate(`/${nickname}/${postID}`, { state: { postID } });
  }
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

  /**
   * 새 글 작성하기로 이동하기 위한 메서드
   */
   const goToWritePost = () => {
    navigate(`/writenewpost`);
  };
  const goToMyBlog = () => {
    navigate(`/${nickname}`);
  };

  const goToPostManagement = () => {
    setManagementType ( 'post');
  };

  const goToCategoryManagement = () => {
    setManagementType ( 'category');
  };
  const removePost = async (postId: string) => {
    try {

      await deletePost(postId);
      fetchPosts(cursor,category.category_id,searchTerm);
    } catch (err) {
      console.error(err);
      if(err.response) alert(`글을 삭제하는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
   
    } finally {
      setLoading(false);
    }
  };
  const handleDelete = (postId: string) => {
    setSelectedPostId(postId);
    setIsModalOpen(true);
  };
  const confirmDelete = () => {
    if (selectedPostId) {
      // 실제 삭제 로직을 여기에 추가
      removePost(selectedPostId);

    }
    setIsModalOpen(false);
    setSelectedPostId(null);
  };
  /**
   * 게시글 불러오기
   */
  const fetchPosts = async (cursor?: string, categoryID?: string, query?:string) => {
    setLoading(true); 
    setError(null);   
    try {
      const nickname=sessionStorage.getItem('nickname');
      setNickname(nickname);
      // console.log(`
      //   =========fetchPosts [게시글 관리]==========
        
      //   nickname:${nickname}
      //   page:${page}
      //   cursor :${cursor}
      //   isBefore:${isBefore}
      //   categoryID:${categoryID}
      //   query:${query}
        

      //   `)
      const fetchedPosts = await getPosts(nickname,page, cursor,isBefore,categoryID,query);
      setIsWriter(fetchedPosts.data.isWriter);
      
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content), // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
      setTotalPages(fetchedPosts.data.total.totalPageCount || 1); // 수정된 부분
      const fetchedCategories: any = await getCategories(nickname);
      setCategories(fetchedCategories.hierarchicalCategory);

   
    } catch (err) {
      if(err.response) alert(`게시물을 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
      setError('게시물을 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };
  // 불필요한 태그 제거 함수 (이미지 태그는 유지)
  const removeUnwantedTags = (html: string): string => {
    // 이미지 태그를 허용하면서 나머지 태그를 제거하도록 설정
    const cleanHtml = DOMPurify.sanitize(html, { 
      USE_PROFILES: { html: true },
      ALLOWED_TAGS: [ 'img'], // 허용할 태그들 (img 포함)
      ALLOWED_ATTR: ['src',], // 허용할 속성들
    });
    return cleanHtml;
  };
  const extractFirstImage = (htmlContent: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    
    const firstImage = doc.querySelector('img'); // 첫 번째 이미지를 선택
    
    return firstImage ? firstImage.outerHTML : null; // 이미지가 있으면 HTML 태그를 반환, 없으면 null 반환
  };
  const handleCategorySelect = (categoryItem: TYPES.category) => {
    setCategory(categoryItem);
    setDropdownOpen(false); // 드롭다운을 닫음
  };
  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // 특수문자 이스케이프
  };

  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    const safeKeyword = escapeRegExp(keyword);
    const regex = new RegExp(`(${safeKeyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };
  const renderCategoryMenu = (categories: TYPES.categories[], level: number = 0) => {
    return (
      <>
        {level === 0 && (
          <div key="none-category" style={{ paddingLeft: `${level * 20}px` }}>
            <button className="dropdown-item" onClick={() => handleCategorySelect({ category_name: '선택 없음', category_id: '' })}>
              선택 없음
            </button>
          </div>
        )}
        {categories.map((categoryItem) => (
          <div key={categoryItem.category_id} style={{ paddingLeft: `${level * 20}px` }}>
            <button className="dropdown-item" onClick={() => handleCategorySelect(categoryItem)}>
              {level !== 0 && (`- ` + categoryItem.category_name)}
              {level === 0 && (categoryItem.category_name)}
            </button>
            {categoryItem.subcategories && level === 0 &&renderCategoryMenu(categoryItem.subcategories, level + 1)}
          </div>
        ))}
      </>
    );
  };

  useEffect(() => {
    const token = sessionStorage.getItem('accessToken');
    if (!token) {
      navigate('/');
    }
  }, [navigate]);

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

  useEffect(() => {
    fetchPosts(cursor,category.category_id,searchTerm);
  }, [currentPage]);

  useEffect(() => {
    setSearchTerm('');
    setCurrentPage(1);
      setCursor('');
      fetchPosts(undefined,category.category_id,searchTerm);
  }, [category]);
  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };
  return (
    <div className="App">
   
      
      {loading ? (
        <></>
      ) : (
        <>
       <Header pageType="otherblog" hasNotifications ={hasNotifications}/>
        <main className="blog-main-container">
        <div className='sticky-profile'>
          <Profile 
          pageType="postManage" 
          nicknameParam={nickname} 
          />
        </div>
          <section className='main-blog-posts-section'>
              <div className='getPost-container'>
                <div className='tabs'>
                  <button
                    className={`tab-button ${managementType === 'post' ? 'active' : ''}`}
                    onClick={goToPostManagement}
                  >
                    글 관리
                  </button>
                  <button
                    className={`tab-button ${managementType === 'category' ? 'active' : ''}`}
                    onClick={goToCategoryManagement}
                  >
                    카테고리 관리
                    <QuestionMark type='category'></QuestionMark>
                  </button>
                </div>
              </div> 
              <hr className="notification-divider" />
              <div >
                {managementType === 'post' && (
                  <>
                    <div className='search-and-sort-container'>
                      <SearchBar onSearch={handleSearch} />
                    </div>
                    
                    <div>
                      <div className="dropdown-getpost" ref={dropdownRef} style={{ width: '300px' }}>
                        <button className="dropdown-getpost-toggle" style={{ fontWeight: 'bold' }} onClick={() => setDropdownOpen(!dropdownOpen)}>
                          {category.category_name}
                          {dropdownOpen ? <img src={upBtn} style={{ width: '15px', height: '15px' }} /> 
                        : <img src={downBtn} style={{ width: '15px', height: '15px' }} />}
                        </button>
                        {dropdownOpen && (
                          <div className="dropdown-getpost-menu">
                            {renderCategoryMenu(categories)}
                          </div>
                        )}
                      </div>
                      {loading ? (
                        <div className="no-posts-message">
                          <div className="no-posts-container">
                          <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
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
                            <div className="post-list">
                          {posts.map((post) => {
                            const firstImage = extractFirstImage(post.board_content);
                            return(
                              <div className="post-card" key={post.board_id}>
                              <div className="post-main-header">
                                <div className="title-container">
                                  <h2
                                    className="post-title"
                                    dangerouslySetInnerHTML={{
                                      __html: highlightKeyword(post.board_title, searchTerm),
                                    }}
                                  ></h2>
                                  <span className="user-nickname">{post.user_nickname}</span>
                                </div>
                                <div className="post-main-meta">
                                  <span className="post-main-category">
                                    {findCategoryById(categories, post.category_id)}
                                  </span>
                                  <span className="post-main-date">{formatDate(post.created_at)}</span>
                                  <span className="post-main-stats">
                                    <span className="post-user-nickname">조회수: {post.board_view}</span>
                                    <span className="post-user-nickname">
                                      <img style={{ width: '15px', height: '15px' }} src={filledCarrot} alt="Carrot Icon" /> : {post.board_like}
                                    </span>
                                    <span className="post-user-nickname">댓글: {post.board_comment}</span>
                                  </span>
                                </div>
                              </div>
                              {/* <div
                                className="post-main-content"
                                onClick={() => goToDetailPost(post.board_id)}
                                dangerouslySetInnerHTML={{
                                  __html: highlightKeyword(post.board_content, searchTerm),
                                }}
                              ></div> */}
                                 {firstImage ? (
                                     <div className="post-main-content-img" onClick={() => goToDetailPost(post.board_id)}>
                                        <div dangerouslySetInnerHTML={{ __html: firstImage }} className="first-image-content"></div>
                                    </div>
                                  ):(
                                    <div className="post-main-content" onClick={() => goToDetailPost(post.board_id)}>
                                      <div dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_content, searchTerm) }} ></div>
                                    </div>
                                  )
                                }
                         

                         
                              <div className="post-actions">
                                <button className="edit-btn" onClick={() => fixPost(post.board_id)}>
                                  수정
                                </button>
                                <button className="delete-btn" onClick={() => handleDelete(post.board_id)}>
                                  삭제
                                </button>
                                <ConfirmModal
                                  isOpen={isModalOpen}
                                  onClose={() => setIsModalOpen(false)}
                                  onConfirm={confirmDelete}
                                  message="이 게시물을 삭제하시겠습니까?"
                                />
                              </div>
                            </div>
                            )
 
                          })}
                        </div>
                        </>
                      )}

                        <div className="pagination">

                          <button className="pagination-btn" onClick={goToFirstPage} disabled={currentPage === 1}>
                            <img src={fastPrevious} style={{width:'20px', height:'20px'}}/>
                          </button>

                          <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <img src={previous} style={{width:'20px', height:'20px'}}/>
                          </button>


                           {renderPages(currentPage, totalPages).map(page => (
                          <button
                            key={page}
                            className={`pagination-page-btn ${currentPage === page ? 'active' : ''}`}
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                          ))}

                          <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            <img src={next} style={{width:'20px', height:'20px'}}/>
                          </button>

                          <button className="pagination-btn" onClick={goToLastPage} disabled={currentPage === totalPages}>
                            <img src={fastNext} style={{width:'20px', height:'20px'}}/>
                          </button>

                        </div>

                    </div>
                  </>
                )}
  
                {managementType === 'category' && (
                  <>
                    <div className="post-manage">
                    
                      <CategorySettings />
                     
                    </div>
                  </>
                )}
              </div>
            
          </section>
      
        <SSEComponent onNotification={handleNotification}></SSEComponent>
      </main>
        </>
      )}
      <Footer />
    </div>
  );
  
};

export default GetPost;
