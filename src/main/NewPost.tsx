import React, { useEffect,useState } from 'react';
import './NewPost.css';
import { Link,useNavigate } from 'react-router-dom';
import { getALLPosts,getCategories } from '../services/getService';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import * as TYPES from '../types/index';

const NewPost: React.FC = () => {
  const [posts, setPosts] =  useState([]);
  const [isBefore, setIsBefore] = useState<boolean>(false);
  const [categories, setCategories] = useState<TYPES.categories[]>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 3;
  const navigate = useNavigate();

  // 불필요한 태그 제거 함수
  const removeUnwantedTags = (html: string): string => {
    const cleanHtml = DOMPurify.sanitize(html, { USE_PROFILES: { html: true } });
    const div = document.createElement('div');
    div.innerHTML = cleanHtml;
    return div.textContent || div.innerText || '';
  };
  /**
  * 게시글 불러오기
  */
  const fetchPosts = async (cursor?: string, categoryID?: string, query?:string) => {
    try {
      console.log(`
        ==================
        fetchPosts Info 
        cursor:${cursor}
        isBefore:${isBefore}
        categoryID:${categoryID}
        query:${query}
        +++++++++++++++++++
        `)
      const fetchedPosts = await getALLPosts(pageSize, cursor,isBefore,categoryID,query);
      
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
      setCursor(fetchedPosts.data.data[fetchedPosts.data.data.length-1].board_id);
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
  useEffect(()=>{

    fetchPosts();
  },[]);

  useEffect(() => {
    console.log(`
      
      
      
      페이지가 변경되면서 글 다시 불러오기
      
      
      
      ${cursor}`)
      fetchPosts(cursor,undefined,undefined);
  }, [currentPage]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 3; // 한번에 보여줄 포스트의 개수

  const nextPosts = () => {
    if (currentPage < totalPages) {
      setCursor(posts[posts.length - 1].board_id);
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPosts = () => {
    if (currentPage > 1) {
      setCursor(posts[0].board_id);
      setIsBefore(true);
      setCurrentPage(currentPage - 1);
    }
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
  const goToAllNewPosts = ()=>{
    navigate(`/dashboard/all-new-post`);
  };
  const goToDetailPost = (postID: string , postAthor:String)=>{
    navigate(`/${postAthor}/${postID}`, { state: { postID } });
  }
  return (
    <section className="newpost-section">
      <div className="slider">
        <h2 style={{marginTop:'-5px', marginLeft:'45px'}}>최신글</h2>
        <span className="all" onClick={goToAllNewPosts}>전체보기</span>
      </div>
      <div className="slider">
        <button className="slide-button left" onClick={prevPosts} disabled={currentPage === 1}>
            &lt;
        </button>
        <div className="posts">
        {!loading && !error && posts.length > 0 && (
        <div className="posts">
          {posts.slice(currentIndex, currentIndex + postsPerPage).map((post, index) => (
            <div key={index} className="post-popular" onClick={() => goToDetailPost(post.board_id, post.user_nickname)}>
              {/* <img src={post.image} alt={post.title} className="post-image" /> */}
              <div className="post-content">{post.board_content}</div>
              <div className="post-popular-content">
              <p className="post-popular-author"><Link to={`/${post.user_nickname}`} className="post-popular-author">작성자: {post.user_nickname}</Link> |{formatDate(post.created_at)}</p>
                <h3 className="post-popular-title">{post.board_title}</h3>
               
                <div className="post-popular-footer">
                  <span className="post-popular-likes">카테고리: {post.category_name}</span>
                  <span className="post-popular-likes">조회수: {post.board_view}</span>
                  <span className="post-popular-likes">🥕: {post.board_like}</span>
                  <span className="post-popular-comments">댓글: {post.board_comment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        </div>
        <button className="slide-button right" onClick={nextPosts} disabled={currentPage === totalPages}>
            &gt;
          </button>
      </div>
    </section>
  );
};

export default NewPost;
