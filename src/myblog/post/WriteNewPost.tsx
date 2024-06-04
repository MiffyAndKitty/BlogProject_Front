import React, { useState, useRef, useEffect, } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './WriteNewPost.css';
import ReactQuill from 'react-quill';
import { newPost } from '../../types';
import { saveNewPost } from '../../services/postService';
import 'react-quill/dist/quill.snow.css';

const WriteNewPost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(true);
  const [category, setCategory] = useState('카테고리 설정');
  const [isComposing, setIsComposing] = useState(false);
  const [tags, setTags] = useState<string[]>(['IT', 'git', '개발']);
  const [tagInput, setTagInput] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newPostResult, setNewPostResult] = useState(''); 
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

  const handleCategorySelect = (category: string) => {
    setCategory(category);
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
  const checkSetLoginResult = async () => {
    const newPost: newPost = { 
      title: title,
      content: content,
      status:status,
    };

    try {
      console.log(newPost);
      const response = await saveNewPost(newPost);
      
      setNewPostResult(response.data.result.toString());
      
      console.log(response);
      if (response.data.result.toString() === 'true') {
        //alert("글 저장에 성공했습니다.");
      }
      return response.data.result;
    } catch (error) {
      console.error("글 저장 오류:", error);     
      return false;
    }
  };
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
    if (newPostResult === 'true') {
      alert("글 저장에 성공했습니다!!");
      
      navigate(`/getpost`);
      
    } else if (newPostResult === 'false') {
      alert("글 저장에 실패했습니다!!");
    }
  }, [newPostResult]);
  return (
    <div className="App">
      <Header pageType="login" />
      <main className="write-new-post">
        <div className="dropdown" ref={dropdownRef}>
          <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {category}
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              <button className="dropdown-item" onClick={() => handleCategorySelect('카테고리 1')}>카테고리 1</button>
              <button className="dropdown-item" onClick={() => handleCategorySelect('카테고리 2')}>카테고리 2</button>
              <button className="dropdown-item" onClick={() => handleCategorySelect('카테고리 3')}>카테고리 3</button>
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
     
          <Form.Group controlId="formPrivate">
            <Form.Check
              type="checkbox"
              label="공개"
              checked={status}
              onChange={handlePrivacyChange}
              className="private"
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

          {/* <Form.Group controlId="formImage">
            <Form.Label>사진 첨부</Form.Label>
            <Form.Control type="file" onChange={handleImageUpload} />
          </Form.Group> */}

          <div className="button-group">
            <Button variant="secondary" type="button">
              임시저장
            </Button>
            <Button onClick={checkSetLoginResult} variant="primary" type="submit">
              저장
            </Button>
          </div>
        </Form>
      </main>
      <Footer />
    </div>
  );
};

export default WriteNewPost;
