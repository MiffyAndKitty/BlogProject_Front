import React, { useEffect,useState } from 'react';
import './NewPost.css';
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
      const fetchedPosts = await getALLPosts(cursor,isBefore,categoryID,query);
      
      const postsWithCleanContent = fetchedPosts.data.data.map(post => ({
        ...post,
        board_content: removeUnwantedTags(post.board_content), // 목록에서만 제거된 내용을 표시
      }));
      setPosts(postsWithCleanContent);
      setTotalPages(fetchedPosts.data.total.totalPageCount); // 전체 페이지 수 설정
      //const fetchedCategories: TYPES.categories[] = await getCategories(nickname);
      //setCategories(fetchedCategories);
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
  useEffect(()=>{

    fetchPosts();
  },[]);
  // const posts = [
  //   {
  //     author: '마법의 소리',
  //     date: '24.02.05 오후 4:04',
  //     title: '겨울이 봄에게 양보할 시간',
  //     content: '눈이 많이 왔네요 ㅎㅎ\n눈 싸람 만들었어요.. 곧 겨울과 봄이 인사할 시간이 오네요...',
  //     likes: 299,
  //     comments: 45,
  //     image: '/path/to/your/snowman_image.png'
  //   },
  //   {
  //     author: '별빛사랑',
  //     date: '24.04.05 오후 8:54',
  //     title: '아름다운 꽃들이 앞다투어...',
  //     content: '다양한 꽃들이 앞다투어 피어나네요..\n화창한 봄이에요..^^\n신이 준 선물, 너무 아름답죠?,,',
  //     likes: 294,
  //     comments: 27,
  //     image: '/path/to/your/rose_image.png'
  //   },
  //   {
  //     author: '도시의빛',
  //     date: '24.03.25 오후 8:54',
  //     title: '도시에서 찾은 작은 평화',
  //     content: '번잡한 도시 속 조용한 카페에서의 한때가\n오랜만에 찾아와 유난히 소중하게 느껴졌어요.',
  //     likes: 357,
  //     comments: 34,
  //     image: '/path/to/your/church_image.png'
  //   },
  //   {
  //     author: '추가된 작성자',
  //     date: '24.05.10 오전 10:15',
  //     title: '새로운 봄의 시작',
  //     content: '새로운 시작과 함께하는 따뜻한 봄입니다. 꽃들이 활짝 피어나는 모습을 보니 마음이 따뜻해지네요.',
  //     likes: 450,
  //     comments: 60,
  //     image: '/path/to/your/spring_image.png'
  //   }
  // ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const postsPerPage = 3; // 한번에 보여줄 포스트의 개수

  const nextPosts = () => {
    if (currentIndex < posts.length - postsPerPage) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevPosts = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
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
  return (
    <section className="newpost-section">
      <h2>새 글</h2>
      <div className="slider">
        {currentIndex > 0 && (
          <button className="slide-button left" onClick={prevPosts}>
            &lt;
          </button>
        )}
        <div className="posts">
        {!loading && !error && posts.length > 0 && (
        <div className="posts">
          {posts.slice(currentIndex, currentIndex + postsPerPage).map((post, index) => (
            <div key={index} className="post-popular">
              {/* <img src={post.image} alt={post.title} className="post-image" /> */}
              <div className="post-content">{post.board_content}</div>
              <div className="post-popular-content">
                <p className="post-popular-author">작성자: {post.user_nickname} |{formatDate(post.created_at)}</p>
                <h3 className="post-popular-title">{post.board_title}</h3>
                <p className="post-popular-text">조회수: {post.board_view}</p>
                <div className="post-popular-footer">
                  <span className="post-popular-likes">🥕: {post.board_like}</span>
                  <span className="post-popular-comments">댓글: {post.board_comment}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        )}
        </div>
        {currentIndex < posts.length - postsPerPage && (
          <button className="slide-button right" onClick={nextPosts}>
            &gt;
          </button>
        )}
      </div>
    </section>
  );
};

export default NewPost;
