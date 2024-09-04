import React, { useEffect, useState } from 'react';
import './PopularTags.css';
import { getPopTags } from '../services/getService';

const PopularTags: React.FC = () => {
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [nowHour, setNowHour] = useState<string>('');

  const fetchTags = async () => {
    try {
      const fetchedTags = await getPopTags();
      setTags(fetchedTags.data);
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
      <h2>{nowHour}시의 인기태그</h2>
      <div className="tags">
        {!loading && !error? (tags.map((tag: any) => (
          <span key={tag.tagName} className="tag">
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
