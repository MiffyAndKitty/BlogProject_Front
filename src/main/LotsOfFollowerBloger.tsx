import React, { useEffect, useState } from 'react';
import './LotsOfFollowerBloger.css';
import { Link,useNavigate } from 'react-router-dom';
import { QuestionMark } from '../resource/QuestionMark';
import { getPopFollower } from '../services/getService';
import mainCharacterImg from '../img/main_character.png';
const LotsOfFollowerBloger: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [blogger, setBlogger] = useState<string[]>([]);
  const navigate = useNavigate();

  const fetchBlogger = async () => {
    try {
      const fetchedBlogger = await getPopFollower();

        setBlogger(fetchedBlogger.data);
    } catch (err) {
      setError('블로거들을 불러오는 중에 오류가 발생했습니다.');
      if(err.response) alert(`블로거들을 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogger();
  }, []);

  const goToBlog=(bloggerName:string) =>{
    navigate(`/${bloggerName}`);
  };

  return (
    <section className="lotsoffollowerbloger-section">
       <div className='h2-question'>
        <h2>지난주 최다 팔로워 보유 블로거</h2>
        <QuestionMark type='Follow'></QuestionMark>
      </div>

      <div className="bloggers">
        {!loading && !error? (blogger.map((blog: any) => (
          <span key={blog.userName} className='blogger' onClick={()=>{goToBlog(blog.userName)}}>
            <img
                src={blog.userImage || mainCharacterImg}
                alt="Profile"
                className={blog.score ===0 ? 'gray-blogger':"heart-no-spin"} 
                onClick={() => goToBlog(blog.userName)}
            />
            <span className='blogger-name'>{blog.userName}</span>
          </span>
        ))):(
          <span className="blogger">
            {error}
          </span>
        )}
      </div>

    </section>
  );
};

export default LotsOfFollowerBloger;
