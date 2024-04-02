import { getUser } from './services/userService';
import { createPost } from './services/postService';

// 사용자 정보 가져오기
getUser('userId').then(userData => {
    console.log(userData);
  // userData는 User 타입입니다.
});

// 새 게시글 생성
const newPost = {
    id: 1,
    title: '새 게시글',
    content: '내용',
    authorId: 1,
};

createPost(newPost).then(postData => {
    console.log(postData);
  // postData는 Post 타입입니다.
});
