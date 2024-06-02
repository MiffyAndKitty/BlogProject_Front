import React, { useState, useRef, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import './WriteNewPost.css';

const WriteNewPost: React.FC = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [category, setCategory] = useState('카테고리 설정');
  const [tags, setTags] = useState(['IT', 'git', '개발']);
  const [image, setImage] = useState<File | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
  };

  const handlePrivacyChange = () => {
    setIsPrivate(!isPrivate);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 여기에 글을 제출하는 로직을 추가하세요 (예: API 호출)
    console.log('Title:', title);
    console.log('Content:', content);
    console.log('Category:', category);
    console.log('Is Private:', isPrivate);
    console.log('Tags:', tags);
    if (image) {
      console.log('Image:', image);
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

  const applyStyle = (style: string, value: string) => {
    if (contentRef.current) {
      contentRef.current.style.setProperty(style, value);
    }
  };

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
          <div className="content-toolbar">
            <button type="button" onClick={() => applyStyle('font-size', '14px')}>14px</button>
            <button type="button" onClick={() => applyStyle('font-size', '18px')}>18px</button>
            <button type="button" onClick={() => applyStyle('font-size', '22px')}>22px</button>
            <button type="button" onClick={() => applyStyle('font-weight', 'normal')}>normal</button>
            <button type="button" onClick={() => applyStyle('font-weight', 'bold')}>bold</button>
          </div>
          <Form.Group controlId="formContent">
            <Form.Control
              as="textarea"
              rows={20}
              placeholder="본문을 입력하세요"
              value={content}
              onChange={handleContentChange}
              ref={contentRef}
            />
          </Form.Group>

          <Form.Group controlId="formPrivate">
            <Form.Check
              type="checkbox"
              label="비공개"
              checked={isPrivate}
              onChange={handlePrivacyChange}
            />
          </Form.Group>

          <div className="tags">
            {tags.map(tag => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>

          <Form.Group controlId="formImage">
            <Form.Label>사진 첨부</Form.Label>
            <Form.Control type="file" onChange={handleImageUpload} />
          </Form.Group>

          <div className="button-group">
            <Button variant="secondary" type="button">
              임시저장
            </Button>
            <Button variant="primary" type="submit">
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
