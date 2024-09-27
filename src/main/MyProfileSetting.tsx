import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMyProfile } from '../services/getService';
import { updateProfile } from '../services/putService';
import { checkPassword,checkDuplicated } from '../services/postService';
import { CheckDuplicatedData } from '../types';
import './MyProfileSetting.css';
import Header from '../structure/Header';
import Footer from '../structure/Footer';
import Profile from './Profile';
import SSEComponent from './SSEComponent';
import openEye from '../img/openEye.png';
import closeEye from '../img/closeEye.png';
const MyProfileSetting: React.FC = () => {
    // const { nickname } = useParams();
    const [newNick, setNewNick] = useState<string>('');
    const [newNickField, setNewNickField] = useState<string>('');
    const [saveNickname, setSaveNickname] = useState(false);

    const [image, setImage] = useState<string | null>(null);
    const [tempImage, setTempImage] = useState<string | null>(null);
    const [saveImage, setSaveImage] = useState<File | null>(null);

    const [userData, setUserData] = useState<any>(null);
    const [editingField, setEditingField] = useState<string | null>(null);

    const [newMessage, setNewMessage] = useState<string>('');
    const [saveNewMessage,setSaveNewMessage] = useState<boolean>(false);

    const [currentPassword, setCurrentPassword] = useState<string>('');
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');

    const [hasNotifications, setHasNotifications] = useState<boolean>(false);

    const [isPasswordVisible, setIsPasswordVisible] = useState(false); // 비밀번호 표시 상태 관리
    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false); // 비밀번호 표시 상태 관리
    const [isNewConfirmPasswordVisible, setIsNewConfirmPasswordVisible] = useState(false); // 비밀번호 표시 상태 관리


    const [errors, setErrors] = useState({
        password: '',
        newPassword: '',
        newPassword2: '',
        newNick: '',
        user_message:'',
    });
    const [isOk, setIsOk] = useState({
        password: false,
        newPassword: false,
        newPassword2: false,
        newNick: false,
        user_message:false
    });
    const [touched, setTouched] = useState({
        newNick: false,
    });

    const navigate = useNavigate();

    const formatDate = (dateString: string): string => {
        let [datePart, timePart] = dateString.split('T');
        let [year, month, day] = datePart.split('-');
        let [hours, minutes, seconds] = timePart.replace('Z', '').split(':');

        seconds = seconds.split('.')[0];
        let hourInt = parseInt(hours);
        let ampm = hourInt >= 12 ? '오후' : '오전';
        hourInt = hourInt % 12;
        hourInt = hourInt ? hourInt : 12;
        const strHours = hourInt.toString().padStart(2, '0');

        return `${year}.${month}.${day} ${ampm} ${strHours}:${minutes}:${seconds}`;
    };

    const fetchMyProfile = async () => {
        try {
            const sessionStorageEmail = sessionStorage.getItem('email');
            if (sessionStorageEmail === null) {
                alert(`잘못된 접근입니다!`);
                navigate('/');
            }
            const fetchedProfile = await getMyProfile(sessionStorageEmail);

            setImage(fetchedProfile.data.user_image);
            setUserData(fetchedProfile.data);
            setNewMessage(fetchedProfile.data.user_message);
            setNewNick(fetchedProfile.data.user_nickname);
            setNewNickField(fetchedProfile.data.user_nickname);
            sessionStorage.setItem('nickname', fetchedProfile.data.user_nickname);
            sessionStorage.setItem('image', fetchedProfile.data.user_image);
            sessionStorage.setItem('message', fetchedProfile.data.user_message);
            if (fetchedProfile.data.isSelf === false) {
                alert(`잘못된 접근입니다!`);
                navigate('/');
            }
        } catch (err) {
            console.log('개인정보를 불러오는 중에 오류가 발생했습니다.');
            if(err.response) alert(`개인정보를 불러오는 중에 오류가 발생했습니다: ${err.response.data.message}`);
        }
    };

    // handleChange 함수 수정
const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    // 문자열의 바이트 길이 계산 함수
    const getByteLength = (str: string) => {
       let byteLength = 0;
       for (let i = 0; i < str.length; i++) {
           byteLength += str.charCodeAt(i) > 0x007f ? 3 : 1; // 한글 3바이트, 영문 1바이트
       }
       return byteLength;
    };

    const byteLength = getByteLength(value);
    // 닉네임과 상태 메시지 글자 수 제한 검증
    if (name === 'user_nickname') {

       

        setTouched({ newNick: true });
        setNewNickField(value); // 닉네임 변경 시 상태 업데이트
        setSaveNickname(true);
        validateFields(value);

        if (byteLength > 30) {
            alert('닉네임은 한글10자/영문30자 이하로 입력해주세요.');
            setErrors(prevErrors => ({
                ...prevErrors,
                newNick: '닉네임은 10자 이하로 입력해주세요.',
            }));
            setIsOk(prevOk => ({ ...prevOk, newNick: false }));
        } else {
          
            setErrors(prevErrors => ({
                ...prevErrors,
                newNick: '',
            }));
            setIsOk(prevOk => ({ ...prevOk, newNick: true }));
        }
    } else if (name === 'user_message') {
        setNewMessage(value);
        setSaveNewMessage(true);
        if (byteLength > 60) {
            alert('상태 메시지는 한글 20자/영문 60자 이하로 입력해주세요.');
            setErrors(prevErrors => ({
                ...prevErrors,
                user_message: '상태 메시지는 20자 이하로 입력해주세요.',
            }));
            setIsOk(prevOk => ({ ...prevOk,  user_message: false }));
        } else {
            setErrors(prevErrors => ({
                ...prevErrors,
                user_message: '',
            }));
            setIsOk(prevOk => ({ ...prevOk,  user_message: true }));
        }
    }

    // setUserData(prevState => ({
    //     ...prevState,
    //     [name]: value,
    // }));
};

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSaveImage(file);
            setTempImage(URL.createObjectURL(file));
        }
    };
    const cancelChangePasswd=()=>{
        setEditingField(null);
        setCurrentPassword(null);
        setNewPassword(null);
        setConfirmPassword(null);

    };

    const cancelProfileImgChange =()=>{
        setEditingField(null);
        setSaveImage(null);
        setTempImage(image);
    };
    const checkDuplication = async (column: string, data: string) => {
        const newPost: CheckDuplicatedData = {
          column: column,
          data: data,
        };
    
        try {
          const response = await checkDuplicated(newPost);
          return response.result;  // 가정: API 응답이 { result: 계산된 값 } 형식일 때
        } catch (error) {
          console.error("중복 확인 오류:", error);
          //if(error.response) alert(`중복 확인 오류가 발생했습니다: ${error.response.data.message}`);
          return false;
        }
      };
    const handleSubmit = async () => {

        const formData = new FormData();
        if(saveNickname) formData.append('nickname', newNickField);
        //if(newPassword) formData.append('password',newPassword);
        if(saveNewMessage) formData.append('statusMessage',newMessage);

        if (saveImage) {
            formData.append('uploaded_files', saveImage);
        }

        try {
            await updateProfile(formData);
            alert('프로필이 성공적으로 업데이트되었습니다.');
          
            setEditingField(null);
            fetchMyProfile();
            
            setTimeout(()=>{
                navigate(`/myProfileSetting`);
                window.location.reload();
            },1000)
        } catch (err) {
            if(err.response) alert(`프로필 업데이트 중 오류가 발생했습니다: ${err.response.data.message}`);
        }
    };
    const handleSubmitPasswd = () =>{
        submitPasswd(newPassword);
    };
    const submitPasswd = async (password:string) => {

        const formData = new FormData();
        formData.append('password',password);

        try {

            await updateProfile(formData);
            alert('프로필이 성공적으로 업데이트되었습니다.');

            setEditingField(null);
            //fetchMyProfile();
            
            setTimeout(()=>{
                navigate(`/myProfileSetting`);
                window.location.reload();
            },1000)
            
            
        } catch (err) {
            if(err.response) alert(`프로필 업데이트 중 오류가 발생했습니다: ${err.response.data.message}`);
            console.log('프로필 업데이트 중 오류가 발생했습니다.');
        }
    };
    const checkPasswordCorrect = async (password: string) => {
        const newData = {
            password: password,
        };

        try {
            const response = await checkPassword(newData);
            return response.result;
        } catch (error) {
            console.error("중복 확인 오류:", error);
            //if(error.response) alert(`중복 확인 중  오류가 발생했습니다: ${error.response.data.message}`);
            return false;
        }
    };
    const validatePassword = (password: string) => {
        const passwordRegex = /^(?=.*[a-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
        return passwordRegex.test(password);
      };
    const handlePasswordChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        if (name === 'currentPassword' ) {
            setCurrentPassword(value);
            
            if (!validatePassword(value)) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    password: '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.',
                    
                }));
            } else{
                const isPasswd = await checkPasswordCorrect(value);
                if(!isPasswd){
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        password: '비밀번호가 틀립니다.',
                    }));
                    setIsOk(prevOk => ({...prevOk,password:false }));
                }
                else {
                    setErrors(prevErrors => ({
                        ...prevErrors,
                        password: '',
                    }));
                    setIsOk(prevOk => ({...prevOk,password:true }));
                }
            }
            
           
        } else if (name === 'newPassword') {
            setNewPassword(value);
            if (!validatePassword(value)) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    newPassword: '비밀번호는 8자 이상, 소문자, 숫자, 특수문자를 포함해야 합니다.',
                    
                }));
                setIsOk(prevOk => ({...prevOk,newPassword:false }));
            } else{
                setErrors(prevErrors => ({
                    ...prevErrors,
                    newPassword: '',
                }));
                setIsOk(prevOk => ({...prevOk,newPassword:true }));
            }
        } else if (name === 'confirmPassword') {
            setConfirmPassword(value);
            if (newPassword !== value) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    newPassword2: '비밀번호가 다릅니다.',
                    
                }));
                setIsOk(prevOk => ({...prevOk,newPassword2:false }));
            } else{
                setErrors(prevErrors => ({
                    ...prevErrors,
                    newPassword2: '',
                }));
                setIsOk(prevOk => ({...prevOk,newPassword2:true }));
            }
        }
    };

    // useEffect(() => {
    //     fetchMyProfile();
    // }, [navigate]);

    const handleNotification = (isNotified: boolean) => {
        setHasNotifications(isNotified); // 알림이 발생하면 true로 설정
    };

    const validateNickname = (nickname: string) => {
        return nickname.trim() !== '';
    };

    useEffect(() => {
        
        fetchMyProfile();
    }, []);


    const validateFields = async (newNicks:string) => {
        if (newNickField.trim() !== '') {
            const isNicknameDuplicate = await checkDuplication('user_nickname', newNicks);
            if (isNicknameDuplicate) {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    newNick: '',
                }));
                setIsOk(prevOk => ({ ...prevOk, newNick: true }));
            } else {
                setErrors(prevErrors => ({
                    ...prevErrors,
                    newNick: '이미 사용 중인 닉네임입니다.',
                }));
                setIsOk(prevOk => ({ ...prevOk, newNick: false }));
            }
        }else{
            setIsOk(prevOk => ({ ...prevOk, newNick: false }));
        }
    };

    

    const renderPasswordFields = () => (
        <div className="password-fields">
            <div className='paswd-field'>
                <div className='password-container'>
                <input
                    type={isPasswordVisible ? 'text' : 'password'} // 상태에 따라 비밀번호 보이기/숨기기
                    placeholder="현재 비밀번호"
                    name="currentPassword"
                    value={currentPassword}
                    onChange={handlePasswordChange}
                    maxLength={255}  // 이메일 입력 길이 제한
                />
                <img
                    src={isPasswordVisible ? closeEye : openEye} // 상태에 따라 아이콘 전환
                    alt="Toggle visibility"
                    className="toggle-password-visibility"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)} // 클릭 시 상태 변경
                    style={{ cursor: 'pointer',  width:'15px', height:'15px' }}
                  />
                </div>
                
                {errors.password && <p style={{color:'red', minHeight: '20px', fontSize:'12px'}}>{errors.password}</p>}
            </div>
            <div className='paswd-field'>
                <div className='password-container'>
                    <input
                        type={isNewPasswordVisible ? 'text' : 'password'} // 상태에 따라 비밀번호 보이기/숨기기
                        placeholder="새 비밀번호"
                        name="newPassword"
                        value={newPassword}
                        onChange={handlePasswordChange}
                        maxLength={255}  // 이메일 입력 길이 제한
                    />
                    <img
                        src={isNewPasswordVisible ? closeEye : openEye} // 상태에 따라 아이콘 전환
                        alt="Toggle visibility"
                        className="toggle-password-visibility"
                        onClick={() => setIsNewPasswordVisible(!isNewPasswordVisible)} // 클릭 시 상태 변경
                        style={{ cursor: 'pointer',  width:'15px', height:'15px' }}
                      />
                </div>
                {errors.newPassword && <p style={{color:'red', minHeight: '20px', fontSize:'12px'}}>{errors.newPassword}</p>}
            </div>
            <div className='paswd-field'>
                <div className='password-container'>
                    <input
                         type={isNewConfirmPasswordVisible ? 'text' : 'password'} // 상태에 따라 비밀번호 보이기/숨기기
                        placeholder="새 비밀번호 확인"
                        name="confirmPassword"
                        value={confirmPassword}
                        onChange={handlePasswordChange}
                        maxLength={255}  // 이메일 입력 길이 제한
                    />
                    <img
                        src={isNewConfirmPasswordVisible ? closeEye : openEye} // 상태에 따라 아이콘 전환
                        alt="Toggle visibility"
                        className="toggle-password-visibility"
                        onClick={() => setIsNewConfirmPasswordVisible(!isNewConfirmPasswordVisible)} // 클릭 시 상태 변경
                        style={{ cursor: 'pointer',  width:'15px', height:'15px' }}
                    />
                </div>
            </div>
            {errors.newPassword2 && <p style={{color:'red', minHeight: '20px', fontSize:'12px'}}>{errors.newPassword2}</p>}
            <div className='submit-cancel'>
                {
                (isOk.password === true && isOk.newPassword === true &&isOk.newPassword2 === true )?
                (<button style={{marginRight:'5px'}} onClick={handleSubmitPasswd}>저장</button>)
                :
                <button disabled={true} style={{backgroundColor:'gray',marginRight:'5px'}}>저장</button>
                }
                
                <button onClick={cancelChangePasswd}>취소</button>
            </div>
        </div>
    );

    const cancelChangeNickname = ()=>{
        setEditingField(null); 
        setNewNickField(userData.user_nickname);
        setSaveNickname(false);
       
    }
    const cancelChangeMessage = ()=>{
        setEditingField(null); 
        setNewMessage(userData.user_message);
        setSaveNewMessage(false);
    }

    const onClickEdit = (field:string)=>{
        setEditingField(field);

    }

    const renderField = (label: string, field: string, type: string = "text", isEditable: boolean = true) => (
        <div className="field-container">
            <label>{label}:</label>
            {editingField === field && isEditable ? (
                field === 'user_password' ? (
                    renderPasswordFields() // 비밀번호 필드는 수정하지 않음
                ) :field === 'user_nickname' ?(
                    <div>
                        <input
                            style={{ background: 'transparent' }}
                            type={type}
                            name={field}
                            maxLength={10} // 닉네임 글자 수 제한
                            value={newNickField }
                            onChange={handleChange}
                        />

                        <div className="submit-cancel">
                            <button 
                            onClick={handleSubmit}
                            disabled={field === 'user_nickname' && !isOk.newNick}
                            style={{
                                marginRight:'5px',
                                backgroundColor: !isOk.newNick ? 'gray' : '', // 닉네임 중복 시 회색 버튼
                                cursor: !isOk.newNick ? 'not-allowed' : 'pointer'
                            }}
                            >저장</button>
                            <button onClick={cancelChangeNickname}>취소</button>
                        </div>
                    </div>
                ): field === 'user_message' ? ( // 상태 메시지일 때는 textarea로 렌더링
                    <div>
                        <textarea
                            style={{ background: 'transparent', width: '60%', height: '60px' }}
                            name={field}
                            value={newMessage}
                      
                            onChange={handleChange}
                        />
                        <div className="submit-cancel">
                            <button 
                            onClick={handleSubmit}
                            disabled={!isOk.user_message}
                            style={{
                                marginRight:'5px',
                                backgroundColor: !isOk.user_message ? 'gray' : '', // 닉네임 중복 시 회색 버튼
                                cursor: !isOk.user_message ? 'not-allowed' : 'pointer'
                            }}
                            >저장</button>
                            <button onClick={cancelChangeMessage}>취소</button>
                        </div>
                    </div>
                ) :(
                    <div>
                        <input
                            style={{ background: 'transparent' }}
                            type={type}
                            name={field}
                            value={ (userData ? userData[field] : '')}
                            onChange={(e) => {
                                handleChange(e);
                                
                            }}
                        />

                        <div className="submit-cancel">
                            <button 
                            onClick={handleSubmit}
                            style={{
                                marginRight:'5px',
                                cursor: 'pointer'
                            }}
                            >저장</button>
                            <button onClick={() => setEditingField(null)}>취소</button>
                        </div>
                    </div>
                )
            ) : (
                <div>
                    <span style={{ background: 'transparent' }}>
                        {field === 'user_password' ? '********' : userData ? userData[field] : ''}
                    </span>
                    {isEditable && <button onClick={() => onClickEdit(field)}>수정</button>} 
                </div>
            )}
        </div>
    );
    

    return (
        <div className="App" >
            <Header pageType="profileSetting" hasNotifications ={hasNotifications}/>
            <main className="blog-main-container">
               
                {/* <div className="MainPosts-section"> */}
                   
                    <Profile pageType="profileSetting" nicknameParam={newNick} />
                        <div className="main-blog-posts-section">
                            {userData && (
                                <>
                                    <h2 style={{color:"#FF88D7"}}>{newNick}의 프로필</h2>
                                    <div className='border'>
                                    <div>
                                            <label style={{fontWeight:'bold', color:'#FF88D7', marginBottom:'5px',}}>프로필 이미지:</label>
                                            </div>
                                        <div className="profile-image-container">
                                            
                                            
                                            {editingField === 'uploaded_files' ? (
                                                <div>

                                                    <div className='image-submit'>
                                                        <input type="file" onChange={handleImageChange} />
                                                        {tempImage && <img src={tempImage} alt="프로필 이미지"/>}
                                                    </div>

                                                    <div  className='submit-cancel'>
                                                        <button style={{marginRight:'5px'}} onClick={handleSubmit}>저장</button>
                                                        <button style={{marginRight:'5px'}} onClick={cancelProfileImgChange}>취소</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div>
                                                    {userData.user_image && <img src={userData.user_image} alt="프로필 이미지"/>}
                                                    <button onClick={() => setEditingField('uploaded_files')}>수정</button>
                                                </div>
                                            )}
                                        </div>
                                        {renderField('아이디(이메일)', 'user_email', 'email', false)} {/* 수정 불가 */}

                                        {renderField('닉네임', 'user_nickname')}
                                        {errors.newNick && <p style={{color:'red', minHeight: '20px', fontSize:'12px'}}>{errors.newNick}</p>}

                                        { userData.user_provider !== 'google' && (renderField('비밀번호', 'user_password', 'password' ))} {/* Google 계정일 경우 수정 불가 */}

                                        {renderField('상태 메시지', 'user_message')}
                                        {errors. user_message && <p style={{color:'red', minHeight: '20px', fontSize:'12px'}}>{errors. user_message}</p>}

                                        <div style={{marginTop:'50px'}}>
                                            <label className='toGray'>서비스 가입일:</label>
                                            <span className='toGray'>{formatDate(userData.created_at)}</span>
                                        </div>
                                        <div>
                                            <label className='toGray'>프로필 마지막 수정일:</label>
                                            <span className='toGray'>{formatDate(userData.updated_at)}</span>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                   
                {/* </div> */}
                <SSEComponent onNotification={handleNotification}></SSEComponent>
            </main>
            <Footer />
        </div>
    );
};

export default MyProfileSetting;
