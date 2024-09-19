import React, { useState, useRef, useEffect, } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './WriteNewPost.css';
import ReactQuill from 'react-quill';
import { newPost, category, categories } from '../../types';
import { saveNewPost, saveNewTempPost } from '../../services/postService';
import { getCategories } from '../../services/getService';
import * as ENUMS from  '../../types/enum'
import 'react-quill/dist/quill.snow.css';
import SSEComponent from '../../main/SSEComponent';
import divider from '../../img/divider.png';
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
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
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
    console.log('handleSubmit Title:', title);
    console.log('handleSubmit Content:', content);
    console.log('handleSubmit Category:', category);
    console.log('handleSubmit Is Private:', status);
    console.log('handleSubmit Tags:', tags);
    if (images) {
      console.log('handleSubmit Images:', images);
    }

    
  };

  const saveImgs = async()=>{
    const quillEditor = quillRef.current?.getEditor();
    if (quillEditor) {
      const imgTags = quillEditor.root.querySelectorAll('img');
      // const newImages: File[] = [];
  
      Array.from(imgTags).map(async (img,index) => {
        if (img.src.startsWith('data:')) {
          const blob = dataURLToBlob(img.src);
          const file = new File([blob], `image_${index}.png`, { type: 'image/png' });
          //수정 중 (지우면 안됌)
          const newSrc = URL.createObjectURL(file);
          //const newSrc = `image_${index + 1}`;

          img.src = newSrc;
          newImages.push(file);
          setImages(newImages); // 상태를 새 배열로 업데이트

          // setContent(quillEditor.root.innerHTML); // content 상태를 수정된 HTML로 업데이트

          console.log('Images saveImgs에서 :', newImages);
          console.log('saveImgs 에서 newSrc, file, newImages', newSrc, file, newImages);
        }
      });

      return newImages;
    }
    return [];
  };
  const savePost = async () => {
    const tagArray = tags.length > 0 ? tags : [];
    console.log(tagArray)
    if(!title || !content){
      alert(errorMessage);
      return;
    }
    const imagesFromSaveImgs = await saveImgs();
    
    console.log('Images in savePost before formData:', imagesFromSaveImgs);


    /**
     * content 영역의 img 태그들을 모두 가져와서 src를 image_${index + 1}로 변경하는 작업 
     */
    let newContent =  '';
    const quillEditor = quillRef.current?.getEditor();
    if (quillEditor) {
      // 에디터의 내용을 복사하여 수정
      const clonedEditor = quillEditor.root.cloneNode(true) as HTMLElement;
      const imgTags = clonedEditor.querySelectorAll('img'); // img 태그들을 모두 가져옴
  
      Array.from(imgTags).forEach((img, index) => {
        // img 태그의 src를 순서대로 image_1, image_2로 변경
        const newSrc = `image_${index + 1}`;
        img.src = newSrc;
      });
  
      // 변경된 content를 다시 업데이트
      newContent = clonedEditor.innerHTML;
      console.log('변경된 content:', quillEditor.root.innerHTML);
    }

    const newPostData: newPost = { 
      title: title,
      content: newContent,
      public: status, // true/false를 1/0으로 변환
      categoryId:category.category_id,
      tagNames:tags,
      uploaded_files: imagesFromSaveImgs.length > 0 ? imagesFromSaveImgs : null // 이미지 배열로 설정
    };
    const formData = new FormData();
    formData.append('title', newPostData.title);
    formData.append('content', newContent);
    formData.append('public', newPostData.public.toString());
    formData.append('categoryId', newPostData.categoryId);
    // 배열의 각 태그를 FormData에 추가
    newPostData.tagNames.forEach(tag => formData.append('tagNames', tag));
    
    if (newPostData.uploaded_files) {
      newPostData.uploaded_files.forEach((file) => {
        formData.append('uploaded_files', file);
      });
    }
    
    try {
      console.log(formData); // FormData 내용을 로그로 출력하여 확인
      console.log(`
      
      
      
      
      
        savePost 에서 newPostData
        
        
        
        
        
        
        
        `,newPostData)
      const response = await saveNewPost(formData);
      if (response.status === ENUMS.status.SUCCESS) {
        console.log(`
          
          
          
          response
          
          
          
          
          
          `,response)
        alert("글 저장에 성공했습니다!!");
        
        navigate(`/getpost`);
        
      } else if (response === false) {
        alert("글 저장에 실패했습니다!!");
      }
      setNewPostResult(response.status === ENUMS.status.SUCCESS ? true : false);
      return response.data.result;
    } catch (error) {
      console.error("글 저장 오류:", error);     
      if(error.response) alert(`글 저장 중에 오류가 발생했습니다: ${error.response.data.message}`); 
      return false;
    }

  };

  
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
    const fetchCategories = async () => {
      try {
        const fetchedCategories: any = await getCategories(sessionStorage.getItem('nickname'));
        setCategories(fetchedCategories.hierarchicalCategory);
        console.log(`fetchedCategories`,fetchedCategories);
      } catch (err) {
        if(err.response){
          alert(`카테고리를 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`); 
          navigate(-1);
        } 
       
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
    // if (newPostResult === true) {
    //   alert("글 저장에 성공했습니다!!");
      
    //   navigate(`/getpost/${nickname}`);
      
    // } else if (newPostResult === false) {
    //   alert("글 저장에 실패했습니다!!");
    // }
  }, [newPostResult, navigate]);
  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };
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
      <Header pageType="otherblog" hasNotifications ={hasNotifications}/>
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
            <Button variant="secondary" type="button" >
              <div style={{display:'flex', flexDirection:'row', justifyContent:'center', alignContent:'center', alignItems:'center'}}>
              <span style={{marginRight:'30px'}}>임시저장 </span>
              <img src={divider} style={{width:'20px', height:'20px'}}></img>
              <span style={{color:'#FF88D7'}}>6</span>
              </div>
              
            </Button>
            <Button onClick={savePost} variant="primary" type="submit">
              저장
            </Button>
          </div>
        </Form>
        <SSEComponent onNotification={handleNotification}></SSEComponent>
      </main>
      <Footer />
    </div>
  );
  
};

export default WriteNewPost;
