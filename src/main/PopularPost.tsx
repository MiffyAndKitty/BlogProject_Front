import React, { useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import './PopularPost.Module.css';
import { getALLPosts,getCategories } from '../services/getService';
import DOMPurify from 'dompurify'; // XSS 방지를 위해 DOMPurify 사용
import filledCarrot from '../img/filledCarrot.png';
const PopularPost: React.FC = () => {
  const [posts, setPosts] =  useState([]);
  const [isBefore, setIsBefore] = useState<boolean>(false);
  // const [categories, setCategories] = useState<TYPES.categories[]>();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [cursor, setCursor] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const pageSize = 3;
  const navigate = useNavigate();
  const extractFirstImage = (htmlContent: string): string | null => {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');
    console.log(`doc`,doc)
    const firstImage = doc.querySelector('img'); // 첫 번째 이미지를 선택
  
    return firstImage ? firstImage.src : null; // 이미지가 있으면 src 반환, 없으면 null 반환
  };
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
  const fetchPosts = async (cursor?: string, categoryID?: string, query?:string,sort?:string) => {
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
      const fetchedPosts = await getALLPosts(pageSize, cursor,isBefore,categoryID,query,sort);
      
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content:post.board_content, // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
      if(fetchedPosts.data.total.totalPageCount){
        setTotalPages(fetchedPosts.data.total.totalPageCount); // 전체 페이지 수 설정
      }else{
        setTotalPages(1);
      }
      // const fetchedCategories: TYPES.categories[] = await getCategories(postsWithCleanContent.user_nickname);
      // setCategories(fetchedCategories);
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

    fetchPosts(undefined,undefined,undefined,'view');
  },[]);
  useEffect(() => {
    console.log(`
      
      
      
      페이지가 변경되면서 글 다시 불러오기
      
      
      
      ${cursor}`)
      fetchPosts(cursor,undefined,undefined,'view');
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
  const goToAllPopularPosts = ()=>{
    navigate(`/dashboard/all-popular-post`);
  };
  const goToDetailPost = (postID: string , postAthor:String)=>{
    navigate(`/${postAthor}/${postID}`, { state: { postID } });
  };
  const goToBlog = (nickname:string, email:string)=>{
    sessionStorage.setItem('other_email',email);
    navigate(`/${nickname}`);
  };
  return (
    <section className="popularpost-section">
      <div className="slider">
        <h2 style={{marginTop:'-5px', marginLeft:'45px'}}>인기글</h2>
        <span className="all" onClick={goToAllPopularPosts}>전체보기</span>
      </div>
      <div className="slider">
        <button className="slide-button left" onClick={prevPosts} disabled={currentPage === 1}>
            &lt;
        </button>
        <div className="posts">
          {!loading && !error && posts.length > 0 && (
            <div className="posts">
              {posts.slice(currentIndex, currentIndex + postsPerPage).map((post, index) => {
                const firstImageSrc = extractFirstImage(post.board_content); // 첫 번째 이미지 추출
                // 이미지가 있을 경우만 has-image 클래스를 추가
                const postClassName = firstImageSrc ? 'post-popular has-image' : 'post-popular';
                return (
                  <div key={index} onClick={() => goToDetailPost(post.board_id, post.user_nickname)} className={postClassName} style={{ backgroundImage: firstImageSrc ? `url(${firstImageSrc})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className={firstImageSrc ? 'post-overlay' : ''}>
                      <div className="post-content" >
                        {removeUnwantedTags(post.board_content)}
                      </div>
                      <div className="post-popular-content">
                        <p className="post-popular-author">
                          <span onClick={() => goToBlog(post.user_nickname, post.user_email)} className={firstImageSrc ? 'post-popular-author-white' : "post-popular-author"}>
                            작성자: {post.user_nickname}
                          </span> <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>| {formatDate(post.created_at)}</span>
                        </p>
                        <h3 className="post-popular-title">{post.board_title}</h3>
                        <div className="post-popular-footer">
                          <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}> {post.category_name}</span>
                          <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>조회수: {post.board_view}</span>
                          <img style={{ width: '15px', height: '15px', marginLeft: '50px' }} src={filledCarrot}></img>
                          <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>: {post.board_like}</span>
                          <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>댓글: {post.board_comment}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                
              })}
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

export default PopularPost;
