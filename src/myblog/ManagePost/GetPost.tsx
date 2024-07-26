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
import ConfirmModal from '../ConfirmModal'; 

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
  const[ managementType, setManagementType] = useState<'post'| 'category'>('post');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [category, setCategory] = useState<TYPES.category>({category_name:'카테고리 설정', category_id:""});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  // const [filteredPosts, setFilteredPosts] = useState<TYPES.getPost[]>([]);
  const navigate = useNavigate();

  const fixPost = (postID: string) => {
    if (isWriter === true) navigate(`/fixpost/${nickname}`, { state: { postID } });
    else alert('수정권한이 없습니다!');
  };

  const formatDate = (dateString: string): string => {
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
  };
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    fetchPosts(undefined,null, term);
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
    navigate(`/writenewpost/${nickname}`);
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
      fetchPosts();
    } catch (err) {
      console.error(err);
      alert('글을 삭제하는 중에 오류가 발생했습니다.');

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
      console.log(`Post ${selectedPostId} deleted`);
    }
    setIsModalOpen(false);
    setSelectedPostId(null);
  };
  /**
   * 게시글 불러오기
   */
  const fetchPosts = async (cursor?: string, categoryID?: string, query?:string) => {
    try {
      const nickname=localStorage.getItem('nickname');
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
      const fetchedPosts = await getPosts(nickname,cursor,isBefore,categoryID,query);
      setIsWriter(fetchedPosts.data.isWriter);
      
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content), // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
      setTotalPages(fetchedPosts.data.total.totalPageCount); // 전체 페이지 수 설정
      const fetchedCategories: TYPES.categories[] = await getCategories(nickname);
      setCategories(fetchedCategories);
      //setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length-1].board_id);
      if (currentPage === 1) {
        setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length - 1].board_id);
      } else if (currentPage === totalPages) {
        setCursor(fetchedPosts.data.data[0].board_id);
      }


      console.log(`


        GetPost 
        ----fetchedPosts---- 


        `,fetchedPosts.data.data, posts);
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
  const handleCategorySelect = (categoryItem: TYPES.category) => {
    setCategory(categoryItem);
    setDropdownOpen(false); // 드롭다운을 닫음
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
            {categoryItem.subcategories && renderCategoryMenu(categoryItem.subcategories, level + 1)}
          </div>
        ))}
      </>
    );
  };
  useEffect(()=>{
    console.log(`


      GetPost 
      ----posts---- 


      `,posts);
      // setFilteredPosts(posts);
  },[posts]); 
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
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
    console.log(`
      
      
      
      페이지가 변경되면서 글 다시 불러오기
      
      
      
      ${cursor} ${category.category_id}`)
    fetchPosts(cursor,category.category_id);
  }, [currentPage]);

  useEffect(() => {
    setCursor('');
    setCurrentPage(1);
    console.log(`
      
      
      
      카테고리가 변경되면서 글 다시 불러오기
      
      
      
      ${cursor} ${category.category_id}`)
    fetchPosts(undefined,category.category_id);
  }, [category]);
  return (
    <>
      <Header pageType="logout" />
      <main>
        <div className="main-container">
          <div className="profile_post_manage">
            <div>
              <img src={mainCharacterImg} alt="Main Character" className="mainCharacter_getpost" />
              <button className="login-button_profile" onClick={goToMyBlog}>
                내 블로그 가기
              </button>
            </div>
            <div className="manage-buttons">
            <button className="manage-button" onClick={goToWritePost}>
                글 작성
              </button>
              <span>  |</span>
              <button className="manage-button" onClick={goToPostManagement}>
                글 관리
              </button>
              <span>  |</span>
              <button className="manage-button" onClick={goToCategoryManagement}>
                카테고리 관리
              </button>
            </div>
          </div>
          <div className="container">
            {
              managementType === 'post' &&(
                <> 
                <h1 className="title_manage">글 관리</h1>
                <SearchBar onSearch={handleSearch}/>
                <div className='post-manage'>
                <div className="dropdown-getpost" ref={dropdownRef} style={{ width: '300px' }}>
                  <button className="dropdown-getpost-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    {category.category_name}
                  </button>
                  {dropdownOpen && (
                    <div className="dropdown-getpost-menu">
                      {renderCategoryMenu(categories)}
                    </div>
                  )}
                </div>
                {!loading && !error && posts.length > 0 && (
                  <div className="post-list">
                    {posts.map((post) => (
                      <div className="post-card" key={post.board_id}>
                        <div className="post-header">
                        <div className="title-container">
                          <h2 className="post-title">{post.board_title}</h2>
                          <span className="user-nickname">{post.user_nickname}</span>
                        </div>
                          <div className="post-meta">
                          <span className="post-category">{ findCategoryById(categories,post.category_id)}</span>
                            <span className="post-date">{formatDate(post.created_at)}</span>
                            <span className="post-stats">
                              <span className="user-nickname">조회수: {post.board_view}</span>
                              <span className="user-nickname">🥕 : {post.board_like}</span>
                              <span className="user-nickname">댓글: {post.board_comment}</span>
                            </span>
                          </div>
                        </div>
                        <div className="post-content">{post.board_content}</div>
                        <div className="post-actions">
                          <button className="edit-btn" onClick={() => fixPost(post.board_id)}>
                            수정
                          </button>
                          <button className="delete-btn" onClick={() => handleDelete(post.board_id)}>삭제</button>
                          <ConfirmModal
                            isOpen={isModalOpen}
                            onClose={() => setIsModalOpen(false)}
                            onConfirm={confirmDelete}
                            message="이 게시물을 삭제하시겠습니까?"
                          />
                        </div>
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

            {
              managementType === 'category' &&(
                <>
                <div className='post-manage'>
                <h1 className="title_manage">카테고리 관리</h1>
                <CategorySettings></CategorySettings>
                </div>
                </>
              )
            }
          
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default GetPost;
