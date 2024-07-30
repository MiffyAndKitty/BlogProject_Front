import React, { useState, useEffect } from 'react';
import { useRef } from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import SearchBar from '../structure/SearchBar';
import '../myblog/ManagePost/GetPost.css';
import * as TYPES from '../types/index';
import filledCarrot from '../img/filledCarrot.png';
import mainCharacterImg from '../img/main_character.png';
import Profile from '../main/Profile';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import { getALLPosts,getCategories } from '../services/getService';
import { deletePost } from '../services/deleteService';
import { useNavigate } from 'react-router-dom';
import CategorySettings from '../myblog/CategorySetting';
import ConfirmModal from '../myblog/ConfirmModal'; 

const AllPopularPost: React.FC = () => {
  const [isWriter, setIsWriter] = useState<boolean>(false);
  const [posts, setPosts] = useState<TYPES.getPost[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nickname, setNickname] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [ managementType, setManagementType] = useState<'post'| 'category'>('post');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
//   const [category, setCategory] = useState<TYPES.category>({category_name:'카테고리 설정', category_id:""});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [token, setToken] = useState<string>('');
  const [localNickName, setLocalNickName] = useState<string>('');
  const pageSize = 10;
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
  const fetchPosts = async (cursor?: string, categoryID?: string, query?:string,sort?:string) => {
    setLoading(true); 
    setError(null);  
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
      const fetchedPosts = await getALLPosts(pageSize, cursor,isBefore,categoryID,query,sort);
      setIsWriter(fetchedPosts.data.isWriter);
      
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content), // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
      if(fetchedPosts.data.total.totalPageCount){
        setTotalPages(fetchedPosts.data.total.totalPageCount); // 전체 페이지 수 설정
      }else{
        setTotalPages(1);
      }
    //   const fetchedCategories: TYPES.categories[] = await getCategories(nickname);
    //   setCategories(fetchedCategories);
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


  useEffect(() => {
    handleSearch(searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    const localStorageToken = localStorage.getItem('accessToken');

    if(localStorageToken ===null){
      setToken('');
    }else{
      setToken(localStorageToken);
    }
    try{
        const localNickname = localStorage.getItem("nickname");
        if (localNickname) {
          setLocalNickName(localNickname);
        }
    }catch(err){
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
        setLocalNickName('');
    }finally {
        setLoading(false);
    }
    
    fetchPosts(undefined,undefined,undefined);
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
      
      
      
      ${cursor}`)
      fetchPosts(cursor,undefined,searchTerm);
  }, [currentPage]);

  const goToDetailPost = (postID: string , postAthor:String)=>{
    navigate(`/${postAthor}/${postID}`, { state: { postID } });
  }
  const highlightKeyword = (text, keyword) => {
    if (!keyword) return text;
    const regex = new RegExp(`(${keyword})`, 'gi');
    return text.replace(regex, '<span class="highlight">$1</span>');
  };
  return (
    <>
      <Header pageType="logout" />
      <main>
        <div className="main-container">
        {(!token && <Profile pageType="signup_for_blog" />)}
        {(token &&<Profile pageType="login" nicknameParam={localNickName}/>)}
          <div className="container">
            {
              managementType === 'post' &&(
                <> 
                <h1 className="title_manage">작성 순으로 전체보기</h1>
                <SearchBar onSearch={handleSearch}/>
                <div className='post-manage'>
                {!loading && !error && posts.length > 0 && (
                  <div className="post-list">
                    {posts.map((post) => (
                      <div className="post-card" key={post.board_id} onClick={() => goToDetailPost(post.board_id, post.user_nickname)}>
                        <div className="post-header">
                        <div className="title-container">
                        <h2 className="post-title"  dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_title, searchTerm) }}></h2>
                          <span className="user-nickname">{post.user_nickname}</span>
                        </div>
                          <div className="post-meta">
                          <span className="post-category">{ post.category_name}</span>
                            <span className="post-date">{formatDate(post.created_at)}</span>
                            <span className="post-stats">
                              <span className="user-nickname">조회수: {post.board_view}</span>
                              <span className="user-nickname"><img style={{width:'15px', height:'15px'}} src={filledCarrot}></img> : {post.board_like}</span>
                              <span className="user-nickname">댓글: {post.board_comment}</span>
                            </span>
                          </div>
                        </div>
                        <div className="post-content"  dangerouslySetInnerHTML={{ __html: highlightKeyword(post.board_content, searchTerm) }}></div>
      
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

            
          
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default AllPopularPost;
