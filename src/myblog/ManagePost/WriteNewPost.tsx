import React, { useState, useRef, useEffect, } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './WriteNewPost.css';
import ReactQuill from 'react-quill';
import { newPost, category, categories } from '../../types';
import { saveNewPost } from '../../services/postService';
import { getCategories } from '../../services/getService';
import * as ENUMS from  '../../types/enum'
import 'react-quill/dist/quill.snow.css';

const WriteNewPost: React.FC = () => {
  const [nickname, setNickname] = useState<string>();
  const quillRef = useRef<ReactQuill>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [category, setCategory] = useState<category>({category_name:'카테고리 설정', category_id:""});
  const [categories,setCategories]  = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newPostResult, setNewPostResult] = useState<boolean | null>(null);
  const navigate = useNavigate();
  const newImages: File[] = [];
  const errorMessage ='제목과 내용을 모두 입력해주세요!';
  const [errors, setErrors] = useState({
    title:'',
    content:''
  });
  const [touched, setTouched] = useState({
    title:'',
    content:''
  });
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  const handleContentChange = async (value: string) => {
    setContent(value);
  };
  
  const dataURLToBlob = (dataURL: string) => {
    const arr = dataURL.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const handlePrivacyChange = () => {
    setStatus(!status);
  };

  const handleCategorySelect = (categoryItem: category) => {
    setCategory(categoryItem);
    setDropdownOpen(false); // 드롭다운을 닫음
  };

  const renderCategoryMenu = (categories: categories[], level: number = 0) => {
    return (
      <>
        {level === 0 && (
          <div key="none-category" style={{ paddingLeft: `${level * 20}px` }}>
            <button className="dropdown-item" onClick={() => handleCategorySelect({ category_name: '선택 없음', category_id: '' })}>
              선택 없음
            </button>
          </div>
        )}
        {categories.map((categoryItem) => (
          <div key={categoryItem.category_id} style={{ paddingLeft: `${level * 20}px` }}>
            <button className="dropdown-item" onClick={() => handleCategorySelect(categoryItem)}>
              {level !== 0 && (`- ` + categoryItem.category_name)}
              {level === 0 && (categoryItem.category_name)}
            </button>
            {categoryItem.subcategories && renderCategoryMenu(categoryItem.subcategories, level + 1)}
          </div>
        ))}
      </>
    );
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTagInput(e.target.value);
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() && !isComposing) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim())&& tags.length < 10) {
        setTags([...tags, tagInput.trim()]);
      }
      if(tags.length===10){
        alert('최대 태그 수 10개를 넘었습니다!');
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
    if (images) {
      console.log('Images:', images);
    }
  };

  const saveImgs = async()=>{
    const quillEditor = quillRef.current?.getEditor();
    if (quillEditor) {
      const imgTags = quillEditor.root.querySelectorAll('img');
      // const newImages: File[] = [];
  
      Array.from(imgTags).map(async (img) => {
        if (img.src.startsWith('data:')) {
          const blob = dataURLToBlob(img.src);
          const file = new File([blob], `image_${newImages.length}.png`, { type: 'image/png' });
          const newSrc = URL.createObjectURL(file);
          img.src = newSrc;
          newImages.push(file);
          setImages(newImages); // 상태를 새 배열로 업데이트
          console.log('Images set in handleContentChange:', newImages);
          console.log('newSrc, file, newImages', newSrc, file, newImages);
        }
      });

      return newImages;
    }
    return [];
  };
  const savePost = async () => {
    if(!title || !content){
      alert(errorMessage);
      return;
    }
    const imagesFromSaveImgs = await saveImgs();
    console.log('Images in savePost before formData:', imagesFromSaveImgs);
    const newPostData: newPost = { 
      title: title,
      content: content,
      public: status, // true/false를 1/0으로 변환
      categoryId:category.category_id,
      tagNames:tags,
      uploaded_files: imagesFromSaveImgs.length > 0 ? imagesFromSaveImgs : null // 이미지 배열로 설정
    };
    const formData = new FormData();
    formData.append('title', newPostData.title);
    formData.append('content', newPostData.content);
    formData.append('public', newPostData.public.toString());
    formData.append('categoryId', newPostData.categoryId);
    newPostData.tagNames.forEach(tag => formData.append('tagNames', tag));
    
    if (newPostData.uploaded_files) {
      newPostData.uploaded_files.forEach((file) => {
        formData.append('uploaded_files', file);
      });
    }
    
    try {
      console.log(formData); // FormData 내용을 로그로 출력하여 확인
      const response = await saveNewPost(formData);
      
      setNewPostResult(response.status === ENUMS.status.SUCCESS ? true : false);
      return response.data.result;
    } catch (error) {
      console.error("글 저장 오류:", error);     
      return false;
    }
  };

  
  useEffect(() => {
    try {
      const storedNickname = localStorage.getItem('nickname');
      if (storedNickname) {
        setNickname(storedNickname);
      }
    } catch (err) {
      console.log(err);
    }
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const fetchedCategories: category[] = await getCategories(localStorage.getItem('nickname'));
        setCategories(fetchedCategories);
        console.log(`fetchedCategories`,fetchedCategories);
      } catch (err) {
        setError('카테고리를 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategories();
  
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (newPostResult === true) {
      alert("글 저장에 성공했습니다!!");
      
      navigate(`/getpost/${nickname}`);
      
    } else if (newPostResult === false) {
      alert("글 저장에 실패했습니다!!");
    }
  }, [newPostResult, navigate]);

  useEffect(() => {
    console.log('Updated images in useEffect:', images);
  }, [images]);

  const validateTitle = (title: string) => {
    return title.trim() !== '';
  };

  const validateContent = (content: string) => {
    return content.trim() !== '';
  };
  useEffect(() => {
    const validateFields = async () => {
      const newErrors = {
        title: touched.title && !validateTitle(title) ? '제목을 입력해주세요.' : '',
        content: touched.content && !validateContent(content) ? '내용을 입력해주세요.' : '',
      };

      setErrors(newErrors);
    };

    validateFields();
  }, [title, content]);

  return (
    <div className="App">
      <Header pageType="logout" />
      <main className="write-new-post">
        <div className="dropdown" ref={dropdownRef} style={{ width: '300px' }}>
          <button className="dropdown-toggle" onClick={() => setDropdownOpen(!dropdownOpen)}>
            {category.category_name}
          </button>
          {dropdownOpen && (
            <div className="dropdown-menu">
              {renderCategoryMenu(categories)}
            </div>
          )}
        </div>
        <Form onSubmit={handleSubmit}>
        <div className="title-and-privacy">
          <Form.Group controlId="formTitle" className="title-input-group">
            <Form.Control
              type="text"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={handleTitleChange}
              className="form-control title-input"
              isInvalid={!!errors.title}
            />
            <Form.Control.Feedback style={{color:'red'}} type="invalid">{errors.title}</Form.Control.Feedback>
          </Form.Group>
          <Form.Group controlId="formPrivate" className="privacy-checkbox-group">
            <Form.Check
              type="checkbox"
              label="공개"
              checked={status}
              onChange={handlePrivacyChange}
              className="private"
            />
          </Form.Group>
          </div>
  
          <div className="separator"></div> {/* 구분선 추가 */}
  
          <Form.Group controlId="formContent">
            <ReactQuill
              ref={quillRef}
              value={content}
              onChange={handleContentChange}
              modules={{
                toolbar: [
                  [{ header: '1' }, { header: '2' }, { font: [] }],
                  [{ list: 'ordered' }, { list: 'bullet' }],
                  ['bold', 'italic', 'underline'],
                  [{ color: [] }, { background: [] }],
                  [{ align: '' }, { align: 'center' }, { align: 'right' }, { align: 'justify' }],
                  ['link', 'image'],
                  ['clean'],
                ],
              }}
              formats={[
                'header',
                'font',
                'list',
                'bullet',
                'bold',
                'italic',
                'underline',
                'color',
                'background',
                'align',
                'link',
                'image',
              ]}
              className="form-control textarea"
            />
            <Form.Control.Feedback style={{color:'red'}} type="invalid">{errors.content}</Form.Control.Feedback>
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
            {tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
                <button type="button" onClick={() => handleTagRemove(tag)}>
                  &times;
                </button>
              </span>
            ))}
          </div>
  
          <div className="button-group">
            <Button variant="secondary" type="button">
              임시저장
            </Button>
            <Button onClick={savePost} variant="primary" type="submit">
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
