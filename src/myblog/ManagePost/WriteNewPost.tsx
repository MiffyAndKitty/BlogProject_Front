import React, { useState, useRef, useEffect,useCallback } from 'react';
import { useNavigate } from "react-router-dom";
import { Form, Button } from 'react-bootstrap';
import Header from '../../structure/Header';
import Footer from '../../structure/Footer';
import './WriteNewPost.css';
import ReactQuill from 'react-quill';
import { newPost, category, categories } from '../../types';
import { saveNewPost, saveNewTempPost } from '../../services/postService';
import { deleteTempPost } from '../../services/deleteService';
import { getCategories,getTempPostList,getTempPost } from '../../services/getService';
import { fixTempPost } from '../../services/putService';
import * as ENUMS from  '../../types/enum'
import 'react-quill/dist/quill.snow.css';
import SSEComponent from '../../main/SSEComponent';
import divider from '../../img/divider.png';
import TempSaveNoti from './TempSaveNoti';
import TempPostList from './TempPostList';
const WriteNewPost: React.FC = () => {
  const notificationButtonRef = useRef<HTMLDivElement>(null); // 임시저장 버튼 참조
  const [nickname, setNickname] = useState<string>();
  const quillRef = useRef<ReactQuill>(null);
  const [title, setTitle] = useState('');
  const [draftId, setDraftId] = useState('');
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
  const [autoSaveTime, setAutoSaveTime] = useState<string>(''); // 자동 저장 시간을 위한 상태 추가
  const [openModal, setOpenModal] =  useState(false);
  const [openTempPostList,setOpenTempPostList] = useState(false);
  const [tempPostsTotalCount,setTempPostsTotalCount] = useState(0);
  const [isTempPostClicked, setIsTempPostClicked] = useState(false);
  const [lastTempPostSaved, setLastTempPostSaved] =  useState('');
  const [isOnceChanged,setIsOnceChanged] = useState(false);
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
  // 시간 포맷팅 함수
  const getCurrentTime = () => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
  };
  const formatDate = (dateString: string): string => {
    const inputDate = new Date(dateString); // 입력된 ISO 형식의 날짜를 Date 객체로 변환
    const currentDate = new Date(); // 현재 시간을 Date 객체로 가져오기
    // const adjustedCurrentDate = new Date(currentDate.getTime() + 9 * 60 * 60 * 1000);
  
    // 두 날짜의 차이를 밀리초로 계산
    const timeDifference = currentDate.getTime() - inputDate.getTime();
  
    // 밀리초를 시간, 일, 주 단위로 변환
    const millisecondsInSecond = 1000;
    const millisecondsInMinute = 1000 * 60;
    const millisecondsInHour = 1000 * 60 * 60;
    const millisecondsInDay = millisecondsInHour * 24;
    const millisecondsInWeek = millisecondsInDay * 7;
  
  
    if (timeDifference < millisecondsInMinute) {
      // 1분 미만인 경우 (N초 전으로 표시)
      const secondsDifference = Math.floor(timeDifference / millisecondsInSecond);
      return `${secondsDifference}초 전`;
    }
    else if (timeDifference < millisecondsInHour) {
      // 1시간 미만인 경우 (N분 전으로 표시)
      const minutesDifference = Math.floor(timeDifference / millisecondsInMinute);
      return `${minutesDifference}분 전`;
    } 
    else if (timeDifference < millisecondsInDay) {
      // 하루가 지나지 않은 경우 (N시간 전으로 표시)
      const hoursDifference = Math.floor(timeDifference / millisecondsInHour);
      return `${hoursDifference}시간 전`;
    } else if (timeDifference < millisecondsInWeek) {
      // 하루에서 일주일 사이인 경우 (N일 전으로 표시)
      const daysDifference = Math.floor(timeDifference / millisecondsInDay);
      return `${daysDifference}일 전`;
    } else {
      let [datePart, timePart] = dateString.split('T');
      let [year, month, day] = datePart.split('-');
      let [hours, minutes, seconds] = timePart.replace('Z', '').split(':');
    
      // 초에서 소수점 제거
      seconds = seconds.split('.')[0];
    
      // 시간을 숫자로 변환
      let hourInt = parseInt(hours);
      let ampm = hourInt >= 12 ? '오후' : '오전';
    
      // 12시간제로 변환
      hourInt = hourInt % 12;
      hourInt = hourInt ? hourInt : 12; // 0이면 12로 설정
    
      const strHours = hourInt.toString().padStart(2, '0');
    
      return `${year}.${month}.${day} ${ampm} ${strHours}:${minutes}:${seconds}`;
    }
  };
  const setPost = (post, categories: categories[]) => {
    setTitle(post.title);
    setContent(post.content);
    setStatus(post.public);
    setTags(Array.isArray(post.tagNames) ? post.tagNames : [post.tagNames]);

    
    const categoryId = post.categoryId;
    //const categoryItem = categories.find(cat => cat.category_id === categoryId);
    const categoryItem = findCategoryById(categories, categoryId);
    console.log(`
      
      
      categoryItem categories
      categoryId:${categoryId}
      
      
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
  const getTempPostDetail = useCallback(async (draftId:string) => {
    try {
     
      if (!draftId) {
        console.warn('Draft ID is not set.');
        return;
      }
      setDraftId(draftId);
      console.log(`
        
        
        
        
        
        
        draftId
        
        
        
        
        
        
        
        
        
        
        
        `,draftId)
      const fetchedPosts = await getTempPost(draftId);
      setPost(fetchedPosts.data, categories); // 카테고리를 함께 전달
      setIsTempPostClicked(true);
    } catch (err) {
      if(err.response){
        alert(`임시저장 게시글 상세 조회 중에 오류가 발생했습니다: ${err.response.data.message}`); 
        navigate(-1);
      } 
      
      setError('데이터를 불러오는 중에 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  },[draftId, categories, navigate]);
  const getTempPosts = async () => {
    try {
      setLoading(true); 
      const fetchedTempPostList = await getTempPostList();
      if (fetchedTempPostList) {
        // 최대 5개의 알림만 저장
        setTempPostsTotalCount(fetchedTempPostList.data.data.totalCount ||0);
        if(fetchedTempPostList.data.data.list){
          setLastTempPostSaved(formatDate(fetchedTempPostList.data.data.list[0].updatedAt));
          setDraftId(fetchedTempPostList.data.data.list[0]._id);
        }
        
        
      }
    } catch (error) {
      // if(error.response) alert(`임시 저장 게시글 목록을 불러오는 중에 오류가 발생했습니다: ${error.response.data.message}`);
      console.error('임시 저장 게시글 목록을 불러오는 중에 오류가 발생했습니다:', error);
      if(error.response.status===404){
        setIsOnceChanged(true);
      }
    }finally{
      setLoading(false);
    }
  };
  useEffect(()=>{
    if(tempPostsTotalCount !==0&& draftId&&!isOnceChanged){
      const userConfirmed = window.confirm(`
        ${lastTempPostSaved} 에 저장된 글이 있습니다.
        이어서 작성하시겠습니까?
        `);

    if (userConfirmed) {
        // 사용자가 확인을 눌렀을 때 실행할 코드
       
        getTempPostDetail(draftId);
    } 
    
    setIsOnceChanged(true);
  }
  },[lastTempPostSaved])
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
        if (!img.src.startsWith('https://')) {
          const newSrc = `image_${index + 1}`;
          img.src = newSrc;
        }
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
          deleteTempPosts(draftId);
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
  const closeModal = () => {
    setOpenTempPostList(false);
  };
  /**
   * 임시저장된 글 삭제
   * @param tempPostID 
   */
  const deleteTempPosts = async (tempPostID: string) => {
    try {
        if (tempPostID) {
            const fetchedDeleteTempPost = await deleteTempPost(tempPostID);
            if (fetchedDeleteTempPost) {
                // alert('팔로워를 취소했습니다!');
                getTempPosts();
            }
        }
    } catch (error) {
      // if(error.response) alert(`임시저장된 게시글을 삭제하는 중에 오류가 발생했습니다: ${error.response.data.message}`);
      //   console.error('임시저장된 게시글을 삭제하는 중에 오류가 발생했습니다:', error);
    }
  };
  /**
   * 최초 임시저장 게시글 저장
   * @returns 
   */
  const saveTempPost = async () => {

    
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
        if (!img.src.startsWith('https://')) {
          const newSrc = `image_${index + 1}`;
          img.src = newSrc;
        }
      });
  
      // 변경된 content를 다시 업데이트
      newContent = clonedEditor.innerHTML;
      console.log(`
        
        
        
        
        
        
        
        
        
        변경된 content:
        


        
        
        
        
        
        
        
        
        `, quillEditor.root.innerHTML);
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
      let response;
      if(isTempPostClicked){

        formData.append('draftId', draftId);
        console.log(`
          
          
          
          
          draftId
          
          
          
          
          `,draftId)
         response = await fixTempPost(formData);
      }else{
        
         response = await saveNewTempPost(formData);
         getTempPosts();
         setIsTempPostClicked(true);
         
      }
      
      if (response.status === ENUMS.status.SUCCESS) {

        //alert("글 저장에 성공했습니다!!");
        setOpenModal(true);
        setAutoSaveTime(getCurrentTime());
        //setTempPostsTotalCount(tempPostsTotalCount+1);
        
        //navigate(`/getpost`);
        
      } else if (response === false) {
        //alert("글 저장에 실패했습니다!!");
      }
      setNewPostResult(response.status === ENUMS.status.SUCCESS ? true : false);
      return response.data.result;
    } catch (error) {
      console.error("글 저장 오류:", error);     
     // if(error.response) alert(`글 저장 중에 오류가 발생했습니다: ${error.response.data.message}`); 
      return false;
    }

  }

  useEffect(() => {
    // 타이머를 저장할 변수
    let autoSaveInterval: NodeJS.Timeout;
  
    const startAutoSave = () => {
      // setInterval을 사용하여 30초마다 saveTempPost 호출
      autoSaveInterval = setInterval(async () => {
        await saveTempPost(); // 비동기 함수가 완료될 때까지 기다림
      }, 30000); // 30초 간격으로 실행
    };
  
    startAutoSave(); // 자동 저장 시작
  
    // 컴포넌트가 언마운트될 때 타이머 정리
    return () => clearInterval(autoSaveInterval);
  }, [saveTempPost]);
  

  useEffect(()=>{
    if(openModal===true){
      const timer = setTimeout(() => {
        setOpenModal(false);
      }, 3000); // 3초 후에 알림 자동 제거
      return () => clearTimeout(timer);
     
    }
    
  },[openModal]);

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
    getTempPosts();
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

  const handleDraftId = (draftId:string) => {
    console.log(`
      
      
      
      
    [handleDraftId]
      draftId : ${draftId}
      
      
      
      
      
      `)
      // 알림이 발생하면 true로 설정
    getTempPostDetail(draftId);
   

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
          
          {openTempPostList &&notificationButtonRef.current && (
             <TempPostList onClose={closeModal} buttonRef={notificationButtonRef} onGetDraftId={handleDraftId}/>
          )}
          
          <div className="button-group">

            <div className='temp-save' ref={notificationButtonRef}>
              <Button variant="secondary" type="button" >
                <div style={{display:'flex', flexDirection:'row', justifyContent:'center', alignContent:'center', alignItems:'center'}}>
                  <span className='tempsave' onClick={saveTempPost}>임시저장 </span>
                  <img src={divider} className='divider'></img>
                  <span className='total-tempsave' onClick={()=>{setOpenTempPostList(true)}}>{tempPostsTotalCount}</span>
                </div>

              </Button>
              {autoSaveTime &&(
                  <span className='tempsave-fin'>임시저장 완료 {autoSaveTime}</span>
              )}
             
            </div>
            
            <TempSaveNoti openModal={openModal}></TempSaveNoti>



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
