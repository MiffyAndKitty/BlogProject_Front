import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './WriteNewPost.css';
import ReactQuill from 'react-quill';
import { newPost, getPostDetail,category } from '../../types';
import * as ENUMS from  '../../types/enum'
import { fixPost } from '../../services/putService';
import { getPost,getCategory } from '../../services/getService';
import 'react-quill/dist/quill.snow.css';

const FixPost: React.FC = () => {
  const location = useLocation();
  const postID = location.state?.postID;
  // const postToEdit = location.state?.postID as getPostDetail;
  // console.log(`postToEdit`,postToEdit);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(true);
  const [category, setCategory] = useState<category>({category_name:'카테고리 설정', category_id:"1"});
  const [categories,setCategories]  = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newPostResult, setNewPostResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (value: string) => {
    setContent(value);
  };

  const handlePrivacyChange = () => {
    setStatus(!status);
  };

  const handleCategorySelect = (categoryItem: category) => {
    setCategory(categoryItem);
    setDropdownOpen(false); // 드롭다운을 닫음
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && !isComposing) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())) {
        setTags([...tags, tagInput.trim()]);
      }
      setTagInput('');
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 글을 제출하는 로직을 추가하세요 (예: API 호출)
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Category:', category);
    console.log('Is Private:', status);
    console.log('Tags:', tags);
    if (image) {
      console.log('Image:', image);
    }
  };

  const fixPosts = async () => {
    const newPost: newPost = { 
      title: title,
      content: content,
      public:status,
      categoryId:category.category_id,
      tagNames:tags,
      uploaded_files: image,
      boardId: postID
    };

    try {
      console.log(newPost);
      const response = await fixPost(newPost);
      
      setNewPostResult(response.status === ENUMS.status.SUCCESS? true: false);
      
      // console.log(response);
      // if (response.data.result.toString() === true) {
      //   //alert("글 저장에 성공했습니다.");
      // }
      return response.data.result;
    } catch (error) {
      console.error("글 저장 오류:", error);     
      return false;
    }
  };
  /**
   * 수정할 글 불러오기
   * @param data 
   */
  const setPost = (post: getPostDetail, categories: category[]) => {
    setTitle(post.board_title);
    setContent(post.board_content);
    setStatus(post.board_public === 1);
    setTags(post.tags);
    const categoryId = post.category_id;
    const categoryItem = categories.find(cat => cat.category_id === categoryId);
    console.log(`
      
      
      categoryItem
      
      
      `,categoryItem)
    if (categoryItem) {
      setCategory(categoryItem);
    }
  }
  useEffect(() => {
    const fetchCategoriesAndPost = async () => {
      try {
        console.log(`localStorage.getItem("nickname"): `, localStorage.getItem("nickname"))
        const fetchedCategories: category[] = await getCategory(localStorage.getItem("nickname"));
        setCategories(fetchedCategories);
        console.log(`setCategories:`, fetchedCategories);
  
        const fetchedPosts = await getPost(postID);
        console.log(`fetchedPosts`, fetchedPosts.data);
        setPost(fetchedPosts.data, fetchedCategories); // 카테고리를 함께 전달
      } catch (err) {
        setError('데이터를 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategoriesAndPost();
  }, [navigate]);
  useEffect(() => {
    console.log(`
      categories
    `, categories);
  }, [categories]);
  useEffect(() => {

    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
   
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (newPostResult === true) {
      alert("글 저장에 성공했습니다!!");
      
      navigate(`/getpost`);
      
    } else if (newPostResult === false) {
      alert("글 저장에 실패했습니다!!");
    }
  }, [newPostResult]);

  return (
    <div className="App">
      <Header pageType="logout" />
      <main className="write-new-post">
        <div className="dropdown" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {category.category_name}
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              {categories.map((categoryItem)=>(
                <button
                  key={categoryItem.category_id}
                  className='dropdown-item'
                  onClick={()=> handleCategorySelect(categoryItem)}>
                    {categoryItem.category_name}
                  </button>
              ))}
            </div>
          )}
        </div>

        <Form onSubmit={handleSubmit}>
          <Form.Group controlId="formTitle">
            <Form.Control
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={handleTitleChange}
              className="form-control title-input"
            />
          </Form.Group>
          <Form.Group controlId="formPrivate">
            <Form.Check
              type="checkbox"
              label="공개"
              checked={status}
              onChange={handlePrivacyChange}
              className="private"
            />
          </Form.Group>
          <div className="separator"></div> {/* 구분선 추가 */}

          <Form.Group controlId="formContent">
            <ReactQuill
              value={content}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ 'header': '1'}, {'header': '2'}, { 'font': [] }],
                  [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                  ['bold', 'italic', 'underline'],
                  [{ 'color': [] }, { 'background': [] }],
                  [{ 'align': [] }],
                  ['link', 'image'],
                  ['clean']
                ],
              }}
              formats={[
                'header', 'font', 'list', 'bullet',
                'bold', 'italic', 'underline',
                'color', 'background',
                'align', 'link', 'image'
              ]}
              className="form-control textarea"
            />
          </Form.Group>
     
          

          <Form.Group controlId="formTagInput">
            <Form.Control
              type="text"
              placeholder="태그를 입력하고 엔터를 누르세요"
              value={tagInput}
              onChange={handleTagInputChange}
              onKeyDown={handleTagInputKeyDown}
              onCompositionStart={() => setIsComposing(true)}
              onCompositionEnd={() => setIsComposing(false)}
              className="tagInput"
            />
          </Form.Group>

          <div className="tags">
            {tags.map(tag => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleTagRemove(tag)}>&times;</button>
              </span>
            ))}
          </div>

          <div className="button-group">
            <Button variant="secondary" type="button">
              임시저장
            </Button>
            <Button onClick={fixPosts} variant="primary" type="submit">
              저장
            </Button>
          </div>
        </Form>
      </main>
      <Footer />
    </div>
  );
};

export default FixPost;
