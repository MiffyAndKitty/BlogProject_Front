import React, { useEffect, useState } from 'react';
import { Link,useNavigate } from 'react-router-dom';
import './PopularPost.Module.css';
import spinner from '../img/Spinner.png';
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
  const [autoSlide, setAutoSlide] = useState<boolean>(true); // 자동 슬라이드 제어
  const [expandEffect, setExpandEffect] = useState<boolean>(false); // 애니메이션 상태
  const [selectedPost, setSelectedPost] = useState<string | null>(null); // 선택된 포스트
  const [cachedPosts, setCachedPosts] = useState<{ [page: number]: any[] }>({});
  const [animationClass, setAnimationClass] = useState<string>('');

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
      setLoading(true);
      if (cachedPosts[currentPage]) {
        // 캐시에 데이터가 있으면 그것을 사용
        setPosts(cachedPosts[currentPage]);
        return;
      }
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
      // 새로운 페이지의 데이터를 캐시에 저장
      setCachedPosts((prev) => ({
        ...prev,
        [currentPage]: postsWithCleanContent,
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
      alert(`인기 게시물을 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`);
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
      ${cursor}
    `);
  
    if (!cachedPosts[currentPage]) {
      // 캐시에 없는 경우에만 fetchPosts 호출
      fetchPosts(cursor, undefined, undefined, 'view');
    } else {
      // 캐시된 데이터가 있으면 그 데이터를 사용
      setPosts(cachedPosts[currentPage]);
    }
  }, [currentPage]);

  useEffect(() => {
    const intervalId = setInterval(() => {
      if (autoSlide) {
        nextPosts();
      }
    }, 3000); // 3초마다 실행
  
    return () => clearInterval(intervalId); // 컴포넌트가 언마운트 될 때 인터벌 정리
  }, [currentPage, autoSlide, posts]);

  
  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 3; // 한번에 보여줄 포스트의 개수

  const nextPosts = () => {
     if (currentPage < totalPages) {
    
    setAnimationClass('slide-out');  // 오른쪽으로 슬라이드
    setTimeout(() => {
      setCursor(posts[posts.length - 1].board_id);
      setIsBefore(false);
      setCurrentPage(currentPage + 1);
      setAnimationClass('');  // 애니메이션 클래스 초기화

    }, 500); // 애니메이션 시간에 맞춰 전환
  } else {
    // 마지막 페이지에서 다시 1페이지로 이동
    setCursor('');
    setCurrentPage(1);
    setIsBefore(false);
  }
  };
  
  const prevPosts = () => {
    if (currentPage > 1) { 
      
      setAnimationClass('slide-in');  // 왼쪽으로 슬라이드
      setTimeout(() => {
        setCursor(posts[0].board_id);
        setIsBefore(true);
        setCurrentPage(currentPage - 1);
        setAnimationClass('');  // 애니메이션 클래스 초기화

      }, 500); // 애니메이션 시간에 맞춰 전환
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
    const params = new URLSearchParams({ sort: 'view' });
    navigate(`/dashboard/all-post?${params.toString()}`);
  };
  const goToDetailPost = (postID: string , postAuthor:String)=>{
    setSelectedPost(postID); // 선택된 포스트 저장
    setExpandEffect(true); // 애니메이션 트리거

    navigate(`/${postAuthor}/${postID}`, { state: { postID } });
  };
  const goToBlog = (nickname:string, email:string)=>{
  
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
            <div className={`posts ${animationClass}`}>
              {posts.slice(currentIndex, currentIndex + postsPerPage).map((post, index) => {
                const firstImageSrc = extractFirstImage(post.board_content); // 첫 번째 이미지 추출
                // 이미지가 있을 경우만 has-image 클래스를 추가
                const postClassName = firstImageSrc ? 'post-popular has-image' : 'post-popular';
                return (
                  <div key={index} onClick={() => goToDetailPost(post.board_id, post.user_nickname)} className={postClassName} style={{ backgroundImage: firstImageSrc ? `url(${firstImageSrc})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    <div className={firstImageSrc ? 'post-overlay' : 'no-post-overlay'} >
                      <div className="post-content2" >
                        {removeUnwantedTags(post.board_content)}
                      </div>
                      <div className="post-popular-content">
                      <h3 className="post-popular-title">{post.board_title}</h3>
                        <p className="post-popular-author">
                          <span onClick={() => goToBlog(post.user_nickname, post.user_email)} className={firstImageSrc ? 'post-popular-author-white' : "post-popular-author"}>
                            {post.user_nickname}
                          </span> <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>| {formatDate(post.created_at)}</span>
                        </p>
                        
                        <div className="post-popular-footer">
                          <span className={firstImageSrc ? "post-popular-category-white" : "post-popular-category"}> {post.category_name}</span>
                          <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>
                            조회수
                             <span className={firstImageSrc ? "post-popular-effect-white" : "post-popular-effect"}> {post.board_view}</span>
                          </span>

                          <div className='carrot-like'>
                            <div style={{marginRight:'3px'}}>
                              <img style={{ width: '15px', height: '15px',  }} src={filledCarrot}></img>
                            </div>
                            
                            <div className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>
                              <span className={firstImageSrc ? "post-popular-effect-white" : "post-popular-effect"}> {post.board_like}</span> 
                            </div>
                          </div>

                          <span className={firstImageSrc ? "post-popular-likes-white" : "post-popular-likes"}>
                            댓글<span className={firstImageSrc ? "post-popular-effect-white" : "post-popular-effect"}> {post.board_comment}</span> 
                            </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
                
              })}
            </div>
          )}

          {loading&&(
             <div className="posts">
             
             <div className='post-popular' style={{  backgroundSize: 'cover', backgroundPosition: 'center' }}>
                   <div className='loading-post-overlay' >
                   <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                     </div>
                   </div>
                   <div className='post-popular' style={{  backgroundSize: 'cover', backgroundPosition: 'center' }}>
                   <div className='loading-post-overlay' >
                   <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                     </div>
                   </div>
                   <div className='post-popular' style={{  backgroundSize: 'cover', backgroundPosition: 'center' }}>
                   <div className='loading-post-overlay' >
                   <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                     </div>
                   </div>
              
           </div>
          )}
        </div>
        <button className="slide-button right" onClick={nextPosts} disabled={currentPage === totalPages}>
            &gt;
        </button>
      </div>
       {/* 배경 확대 애니메이션 */}
    </section>
  );
};

export default PopularPost;
