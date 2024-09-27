import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from "react-router-dom";
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
import SSEComponent from '../../main/SSEComponent';
import spinner from '../../img/Spinner.png';

const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20MB 제한 

const FixPost: React.FC = () => {
  
  const [nickname, setNickname] = useState<string>();
  const quillRef = useRef<ReactQuill>(null);
  const location = useLocation();
  let {postID} = useParams<{postID: string}>();
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
  const [hasNotifications, setHasNotifications] = useState<boolean>(false);
  const[imgsSize,setImgsSize] = useState({});
  const newImages: File[] = [];

  const errorMessage ='제목과 내용을 모두 입력해주세요!';

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(getByteLength(e.target.value) >300){
      alert('제목은 한글100자/영문300자 이하로 입력해주세요.')
    }else{
      setTitle(e.target.value);
    }
    
  };
  const checkImgs = async () => {
    const quillEditor = quillRef.current?.getEditor();
    const checkedImgs = [];
  
    if (quillEditor) {
      const imgTags = quillEditor.root.querySelectorAll('img');
  
      // 비동기 작업을 처리하기 위해 for...of 루프를 사용합니다.
      for (const img of Array.from(imgTags)) {
        if (img.src.startsWith('data:')) {
          const blob = dataURLToBlob(img.src);
          const file = new File([blob], `image_${checkedImgs.length}.png`, { type: 'image/png' });
          checkedImgs.push(file);
        }

       
      }
    }
  
    return checkedImgs;
  };

  const handleContentChange = async(value: string) => {
    let validFiles: File[] = await checkImgs();
   
    let totalFileSize = 0;
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      totalFileSize += file.size;
     
    }
    const beforeImgsSize =  checkBeforeImgsSize();
    totalFileSize+=beforeImgsSize;
    console.log(`
      
      
      
      [handleContentChange]
      beforeImgsSize: ${beforeImgsSize}
      totalFileSize: ${totalFileSize}
      validFiles:
      
      
      
      
      
      
      `,validFiles)
    if (totalFileSize > MAX_IMAGE_SIZE) {
      alert('이미지 파일은 20MB 이하로만 업로드할 수 있습니다.');
  
      // 이미지가 추가된 상태이므로 마지막으로 추가된 이미지를 제거합니다.
      const quillEditor = quillRef.current?.getEditor();
      if (quillEditor) {
        const imgTags = quillEditor.root.querySelectorAll('img');
        
        // 가장 마지막으로 추가된 이미지를 제거합니다.
        if (imgTags.length > 0) {
          imgTags[imgTags.length - 1].remove(); // 마지막 이미지를 DOM에서 제거
        }
  
        // 에디터의 수정된 내용을 다시 content로 설정합니다.
        const updatedContent = quillEditor.root.innerHTML;
        setContent(updatedContent);
      }
    } else {
      // 이미지 파일 크기가 제한 이내인 경우에만 content를 업데이트합니다.
      setContent(value);
    }
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
            {categoryItem.subcategories &&level === 0 && renderCategoryMenu(categoryItem.subcategories, level + 1)}
          </div>
        ))}
      </>
    );
  };
  const getByteLength = (str: string) => {
    let byteLength = 0;
    for (let i = 0; i < str.length; i++) {
        byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
    }
    return byteLength;
 };
  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if(getByteLength(e.target.value)>45){
      alert('태그는 한글15자/영문45자 이하로 입력해주세요.')
    }else{
      setTagInput(e.target.value);
    }
   
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
   
    // console.log('Title:', title);
    // console.log('Content:', content);
    // console.log('Category:', category);
    // console.log('Is Private:', status);
    // console.log('Tags:', tags);
    // if (images) {
    //   console.log('Image:', images);
    // }
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
          // console.log('Images set in handleContentChange:', newImages);
          // console.log('newSrc, file, newImages', newSrc, file, newImages);
        }
        else{
          
        }
      });

      return newImages;
    }
    return [];
  };
  const handleNotification = (isNotified: boolean) => {
    setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
  };

  // 불필요한 태그만 있는지 확인하는 함수
  const isContentEmpty = (htmlContent: string) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = htmlContent;

    // 텍스트 노드를 포함한 모든 텍스트를 가져옴 (공백은 제외)
    const textContent = tempElement.textContent?.trim() || '';

    // 텍스트가 비어 있으면 내용이 없는 것으로 간주
    return textContent === '';
  };

  const fixPosts = async () => {
    if(!title || !content){
      alert(errorMessage);
      return;
    }

    const imagesFromSaveImgs = await saveImgs();
    // console.log('Images in savePost before formData:', imagesFromSaveImgs);

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
     // console.log('변경된 content:', quillEditor.root.innerHTML);
    }


    const newPostData: newPost = { 
      title: title,
      content: newContent,
      public: status, // true/false를 1/0으로 변환
      categoryId:category.category_id,
      tagNames:tags,
      uploaded_files: imagesFromSaveImgs.length > 0 ? imagesFromSaveImgs : null, // 이미지 배열로 설정
      boardId: postID
    };
    const formData = new FormData();
    formData.append('title', newPostData.title);
    formData.append('content', newContent);
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
      setLoading(true);
      const response = await fixPost(formData);
      if (response.status === ENUMS.status.SUCCESS) {
        alert("글 저장에 성공했습니다!!");
        
        navigate(`/getpost`);
        
      } else if (newPostResult === false) {
        alert("글 저장에 실패했습니다!!");
      }
      setNewPostResult(response.status === ENUMS.status.SUCCESS ? true : false);
      
      return response.data.result;
    } catch (error) {
      if(error.response) alert(`글 수정 중에 오류가 발생했습니다: ${error.response.data.message}`); 
      console.error("글 저장 오류:", error);     
      return false;
    }finally{
      setLoading(false);
    }
  };
  const checkBeforeImgsSize = ()=>{
    let totalSize = 0;
    const quillEditor = quillRef.current?.getEditor();
  
    if (quillEditor) {
      const imgTags = quillEditor.root.querySelectorAll('img');
  
      // 비동기 작업을 처리하기 위해 for...of 루프를 사용합니다.
      for (const img of Array.from(imgTags)) {
        if (img.src.startsWith('https://')) {
          // 값을 순회합니다.
          for (let key of Object.keys(imgsSize)) {

           
            if(key === img.src){

              totalSize += imgsSize[key];
            }
          }
        }

       
      }
    }
    return totalSize;
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
    setImgsSize(post.imageSizes.sizes);
    const categoryId = post.category_id;
    //const categoryItem = categories.find(cat => cat.category_id === categoryId);
    const categoryItem = findCategoryById(categories, categoryId);

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
      
        const fetchedCategories: any= await getCategories(sessionStorage.getItem("nickname"));
        setCategories(fetchedCategories.hierarchicalCategory);
        setLoading(true);
        const fetchedPosts = await getPost(postID);
        setLoading(false);
        setPost(fetchedPosts.data, fetchedCategories.hierarchicalCategory); // 카테고리를 함께 전달
      } catch (err) {
        if(err.response){
          alert(`글 조회 중에 오류가 발생했습니다: ${err.response.data.message}`); 
          navigate(-1);
        } 
        
        setError('데이터를 불러오는 중에 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };
  
    fetchCategoriesAndPost();
  }, [navigate]);

  
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
    // if (newPostResult === true) {
    //   alert("글 저장에 성공했습니다!!");
      
    //   navigate(`/getpost/${nickname}`);
      
    // } else if (newPostResult === false) {
    //   alert("글 저장에 실패했습니다!!");
    // }
  }, [newPostResult]);

  return (
    <div className="App">
      <Header pageType="otherblog" hasNotifications ={hasNotifications}/>
      { !loading &&(
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
         
         <div style={{display:'flex', justifyContent:'flex-end'}}>
         
           <Button onClick={fixPosts} variant="primary" type="submit">
             저장
           </Button>
         </div>
       </Form>
       <SSEComponent onNotification={handleNotification}></SSEComponent>
      </main>
      )}

      {loading &&(
         <main className="write-new-post">
          <div style={{ textAlign: 'center', padding: '20px', fontSize: '18px', color: '#555' }}>
                    <div style={{ marginBottom: '10px' }}>
                      <img src={spinner} alt="Loading..." style={{ width: '50px', height: '50px' }} />
                    </div>
                    <span>로딩 중...</span>
                  </div>
         <SSEComponent onNotification={handleNotification}></SSEComponent>
       </main>
      )}
     
      <Footer />
    </div>
  );
};

export default FixPost;
