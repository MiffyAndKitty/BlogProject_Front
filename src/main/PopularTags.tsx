import React, { useEffect, useState } from 'react';
import './PopularTags.css';
import { getPopTags } from '../services/getService';
import { Link,useNavigate } from 'react-router-dom';
import { QuestionMark } from '../resource/QuestionMark';

const PopularTags: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nowHour, setNowHour] = useState<string>('');
  const navigate = useNavigate();

  const fetchTags = async () => {
    try {
      const fetchedTags = await getPopTags();
      console.log(`
        
        fetchedTags
        
        `,fetchedTags)
      setTags(fetchedTags.data);
    } catch (err) {
      alert(`태그들을 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`);
      setError('태그들을 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTags();
    const now = new Date();
    const hours = now.getHours().toString();
    setNowHour(hours);
  }, []);

  const goToTagPost=(tag:string) =>{
    navigate(`/dashboard/all-post/${tag}`);
  };
  return (
    <section className="populartags-section">

      <div className='h2-question'>
        <h2>{nowHour}시의 인기태그</h2>
        <QuestionMark type='tag'></QuestionMark>
      </div>
      

      <div className="tags">
        {!loading && !error? (tags.map((tag: any) => (
          
          <span key={tag.tagName} className={tag.score ===0 ? 'gray-tag':'tag'} onClick={()=>{goToTagPost(tag.tagName)}}>
            {tag.tagName}
          </span>
        ))):(
          <span className="tag">
            {error}
          </span>
        )}
      </div>
    </section>
  );
};

export default PopularTags;
