import React, { useState } from 'react';
import './NewPost.css';

const NewPost: React.FC = () => {
  const posts = [
    {
      author: '마법의 소리',
      date: '24.02.05 오후 4:04',
      title: '겨울이 봄에게 양보할 시간',
      content: '눈이 많이 왔네요 ㅎㅎ\n눈 싸람 만들었어요.. 곧 겨울과 봄이 인사할 시간이 오네요...',
      likes: 299,
      comments: 45,
      image: '/path/to/your/snowman_image.png'
    },
    {
      author: '별빛사랑',
      date: '24.04.05 오후 8:54',
      title: '아름다운 꽃들이 앞다투어...',
      content: '다양한 꽃들이 앞다투어 피어나네요..\n화창한 봄이에요..^^\n신이 준 선물, 너무 아름답죠?,,',
      likes: 294,
      comments: 27,
      image: '/path/to/your/rose_image.png'
    },
    {
      author: '도시의빛',
      date: '24.03.25 오후 8:54',
      title: '도시에서 찾은 작은 평화',
      content: '번잡한 도시 속 조용한 카페에서의 한때가\n오랜만에 찾아와 유난히 소중하게 느껴졌어요.',
      likes: 357,
      comments: 34,
      image: '/path/to/your/church_image.png'
    },
    {
      author: '추가된 작성자',
      date: '24.05.10 오전 10:15',
      title: '새로운 봄의 시작',
      content: '새로운 시작과 함께하는 따뜻한 봄입니다. 꽃들이 활짝 피어나는 모습을 보니 마음이 따뜻해지네요.',
      likes: 450,
      comments: 60,
      image: '/path/to/your/spring_image.png'
    }
  ];

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
  return (
    <section className="newpost-section">
      <h2 style={{marginTop:'50px'}}>새 글</h2>
      <div className="slider">
        {currentIndex > 0 && (
          <button className="slide-button left" onClick={prevPosts}>
            &lt;
          </button>
        )}
        <div className="posts">
          {posts.slice(currentIndex, currentIndex + postsPerPage).map((post, index) => (
            <div key={index} className="post">
              <img src={post.image} alt={post.title} className="post-image" />
              <div className="post-content">
                <p className="post-author">작성자: {post.author} | {post.date}</p>
                <h3 className="post-title">{post.title}</h3>
                <p className="post-text">{post.content}</p>
                <div className="post-footer">
                  <span className="post-likes">🥕: {post.likes}</span>
                  <span className="post-comments">댓글: {post.comments}</span>
                </div>
              </div>
            </div>
          ))}
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
