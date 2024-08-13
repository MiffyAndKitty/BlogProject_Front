import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './WriteNewPost.css';
import ReactQuill from 'react-quill';
import { newPost, getPostDetail,category,categories } from '../../types';
import * as ENUMS from  '../../types/enum'
import { fixPost } from '../../services/putService';
import { getPost,getCategories } from '../../services/getService';
import 'react-quill/dist/quill.snow.css';

const FixPost: React.FC = () => {
  const [nickname, setNickname] = useState<string>();
  const quillRef = useRef<ReactQuill>(null);
  const location = useLocation();
  const postID = location.state?.postID;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState(true);
  const [category, setCategory] = useState<category>({category_name:'카테고리 설정', category_id:""});
  const [categories,setCategories]  = useState([]);
  const [isComposing, setIsComposing] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [images, setImages] = useState<File[]>([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [newPostResult, setNewPostResult] = useState<boolean | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const newImages: File[] = [];

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
      // if(tags.length===10){
      //   alert('최대 태그 수 10개를 넘었습니다!');
      // }
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
      console.log('Image:', images);
    }
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
        else{
          
        }
      });

      return newImages;
    }
    return [];
  };
  const fixPosts = async () => {

    const imagesFromSaveImgs = await saveImgs();
    console.log('Images in savePost before formData:', imagesFromSaveImgs);
    const newPostData: newPost = { 
      title: title,
      content: content,
      public: status, // true/false를 1/0으로 변환
      categoryId:category.category_id,
      tagNames:tags,
      uploaded_files: imagesFromSaveImgs.length > 0 ? imagesFromSaveImgs : null, // 이미지 배열로 설정
      boardId: postID
    };
    const formData = new FormData();
    formData.append('title', newPostData.title);
    formData.append('content', newPostData.content);
    formData.append('public', newPostData.public.toString());
    formData.append('categoryId', newPostData.categoryId);
    formData.append('boardId', newPostData.boardId);
    newPostData.tagNames.forEach(tag => formData.append('tagNames', tag));
    
    if (newPostData.uploaded_files) {
      newPostData.uploaded_files.forEach((file) => {
        formData.append('uploaded_files', file);
      });
    }
    
    try {
      const response = await fixPost(formData);
      
      setNewPostResult(response.status === ENUMS.status.SUCCESS ? true : false);
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
  const setPost = (post: getPostDetail, categories: categories[]) => {
    setTitle(post.board_title);
    setContent(post.board_content);
    setStatus(post.board_public === 1);
    setTags(post.tags);
    const categoryId = post.category_id;
    //const categoryItem = categories.find(cat => cat.category_id === categoryId);
    const categoryItem = findCategoryById(categories, categoryId);
    console.log(`
      
      
      categoryItem categories
      
      
      `,categoryItem,categories)
    if (categoryItem) {
      setCategory(categoryItem);
    }
  };

  // 주어진 카테고리 ID를 찾기 위한 재귀 함수
  const findCategoryById = (categories: categories[], categoryId: string): category | undefined => {
    for (const category of categories) {
      if (category.category_id === categoryId) {
        return category;
      }
      if (category.subcategories) {
        const foundCategory = findCategoryById(category.subcategories, categoryId);
        if (foundCategory) {
          return foundCategory;
        }
      }
    }
    return undefined;
  };
  useEffect(() => {
    const fetchCategoriesAndPost = async () => {
      try {
        console.log(`sessionStorage.getItem("nickname"): `, sessionStorage.getItem("nickname"))
        const fetchedCategories: categories[] = await getCategories(sessionStorage.getItem("nickname"));
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
    try {
      const storedNickname = sessionStorage.getItem('nickname');
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
  }, [newPostResult]);

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
            />
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
              placeholder="태그를 입력하고 엔터를 누르세요 (최대 10개)"
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
