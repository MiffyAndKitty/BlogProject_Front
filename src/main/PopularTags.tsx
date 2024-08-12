import React, { useEffect, useState } from 'react';
import './PopularTags.css';
import {getPopTags} from '../services/getService'
const PopularTags: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nowHour, setNowHour] = useState<string>('');
  if (error) {
    return <div>{error}</div>;
  }
  const fetchTags = async () => {
    try {
      const fetchedTags = await getPopTags();
      console.log(`
      
      
      
        fetchedTags
        
        
        `,fetchedTags)
      setTags(fetchedTags.data);
      console.log('fetchedTags',fetchedTags)
    } catch (err) {
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
  return (
    <section className="populartags-section">
      <h2> {nowHour}시의 인기태그</h2>
      <div className="tags">
  {tags.map((tag, index) => {
    // 각 5개마다 줄바꿈을 위해 줄 그룹을 만든다
    if (index % 5 === 0) {
      return (
        <div key={index} className="tag-row">
          {tags.slice(index, index + 5).map((subTag) => (
            <span key={subTag} className="tag">
              {subTag}
            </span>
          ))}
        </div>
      );
    }
    return null; // 이미 처리된 태그는 렌더링하지 않음
  })}
</div>

    </section>
  );
};

export default PopularTags;
