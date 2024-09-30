## 🌸 공감과 이야기가 피어나는 블로그

> 사람들이 댓글과 게시글을 통해 생각과 이야기를 나누고, 사용자 프로필 및 게시글을 손쉽게 관리할 수 있도록 설계된 **사용자 중심의 블로그 플랫폼**입니다.

![블로그 메인 페이지 사진](captures/dashboardPage.png)

---

## 📚 목차

- [🖥️ 서버 구조](#🖥️-서버-구조)
- [💻 화면 설계](#💻-화면-설계)
- [⚙️ 기술 스택](#⚙️-기술-스택)
- [🛠️ 주요 기능 소개](#🛠️-주요-기능-소개)
  > [기능 1: 인증 구현](#기능-1-인증-구현)  
  > [기능 2: 게시판 및 카테고리 구현](#기능-2-게시판-및-카테고리-구현)  
  > [기능 3: 사용자 팔로우 및 프로필 관리](#기능-3-사용자-팔로우-및-프로필-관리)  
  > [기능 4: 임시 저장 기능](#기능-4-임시-저장-기능)
- [👥 팀원 소개](#👥-팀원-소개)

---

## 🖥️ 서버 구조

![서버 구조](captures/server_structure.png)

---

## 💻 화면 설계

 ![Figma 디자인 미리보기](captures/figma.png)(https://www.figma.com/design/oLBgJllzx29LyORdwuDxPy/%EB%B8%94%EB%A1%9C%EA%B7%B8?node-id=0-1&t=WHfwLbrHGKrM6WwB-1)


---

## ⚙️ 기술 스택

| **분류**     | **스택**                                                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Frontend** | ![React](https://img.shields.io/badge/React-61DAFB?style=for-the-badge&logo=react&logoColor=white)                                                                                                                                                                                                                                                                                                                              |
| **Backend**  | ![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white) ![Express](https://img.shields.io/badge/Express.js-404D59?style=for-the-badge&logo=express&logoColor=white)                                                                                                                                                                                                            |
| **Database** | ![MariaDB](https://img.shields.io/badge/MariaDB-003545?style=for-the-badge&logo=mariadb&logoColor=white) ![Redis](https://img.shields.io/badge/Redis-DC382D?style=for-the-badge&logo=redis&logoColor=white) ![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white) ![AWS S3](https://img.shields.io/badge/AWS%20S3-FF9900?style=for-the-badge&logo=amazon-s3&logoColor=white) |

---

## 🛠️ 주요 기능 소개

### 기능 1: 인증 구현

- **회원가입**: 사용자가 조건에 맞는 아이디(실존하는 이메일), 인증번호, 비밀번호, 닉네임을 입력하여 회원가입하거나, 구글 아이디를 통해 회원가입합니다.

   <details>
    <summary>회원가입 페이지</summary>
     
    ![회원가입](captures/signup.png)

    > 회원가입 버튼을 누르면, 계정 또는 구글로 회원가입할 수 있는 버튼이 도출됩니다. 
 
  </details>

  <details>
    <summary>로컬 회원가입</summary>
    
    ![로컬 회원가입](captures/local_signup_auth.png)
  
    > 아아디로 사용할 이메일을 입력 후, 인증번호 전송을 클릭하면 해당 이메일로 인증번호가 전송됩니다.
    
    ![로컬 회원가입](captures/local_signup_auth_email.png)
  
    > 이메일로 받은 인증번호입니다.
    
     ![로컬 회원가입](captures/local_signup_2.png)
  
    > 이메일 인증, 사용할 비밀번호, 닉네임의 조건을 모두 만족하면 회원가입 버튼이 disable -> able 상태가 되어 클릭할 수 있습니다.
 
  </details>

   <details>
    <summary>구글 회원가입</summary>
     
    ![구글 회원가입](captures/google_login.png)

    > 구글 아이디를 클릭하여 해당 서비스에 회원가입할 수 있습니다.
    
    ![구글 회원가입](captures/google_signup_nickname.png)

    > 닉네임 설정 페이지가 도출되며, 입력한 닉네임으로 활동하게 됩니다. 추후에 수정할 수 있습니다.
  
  </details>


- **구글 로그인**: 구글 OAuth를 이용하여 간편하게 로그인할 수 있습니다.

  <details>
    <summary>구글 로그인 흐름 보기</summary>

  1. 사용자가 구글 로그인을 시도
  2. 백엔드에서 구글 OAuth 처리 후, 사용자 정보가 로컬 DB에 있으면 로그인, 없으면 자동으로 회원가입 처리
  3. 로그인 성공 후 JWT 토큰을 발급하여 사용자에게 반환



  </details>

- **로그인된 사용자 인증**: JWT 토큰을 통해 사용자 인증을 처리하고, 토큰이 없을 경우 발급된 쿠키로 동일 사용자인지 확인합니다.

  <details>
    <summary>로그인된 사용자 인증 흐름 보기</summary>

 

  </details>

---

### 기능 2: 게시판 및 카테고리 구현

- **이미지 업로드**: **AWS S3**를 이용하여 게시글에 이미지를 포함시킬 수 있습니다.
  <details>
    <summary>S3를 통한 이미지 업로드 흐름 보기</summary>
  
  </details>

- **캐시 처리**: **Redis**를 활용하여 조회수 및 좋아요 데이터를 효율적으로 처리합니다.
- **게시판 및 카테고리 CRUD**: 게시글과 카테고리를 생성, 조회, 수정, 삭제할 수 있는 기능을 제공합니다.

---

### 기능 3: 사용자 팔로우 및 프로필 관리

- **사용자 알림 기능**: 게시글에 댓글이나 좋아요가 달리면 실시간으로 알림을 받을 수 있습니다. (SSE 사용)

  <details>
    <summary>SSE 연결 및 알림 수신 흐름 보기</summary>



  </details>

- **팔로우/언팔로우 기능**: 다른 사용자를 팔로우하거나 팔로우를 취소할 수 있습니다.
- **프로필 관리**: 프로필 사진 및 사용자 정보를 손쉽게 수정할 수 있는 기능을 제공합니다.

---

### 기능 4: 임시 저장 기능

- **게시글 임시 저장**: 작성 중인 게시글을 임시로 저장하고, 나중에 불러와서 다시 작성할 수 있는 기능을 제공합니다. **MongoDB**를 사용하여 임시 저장을 구현하였습니다.

---

## 👥 팀원 소개

|                   프론트엔드 개발                   |                    백엔드 개발                    |
| :-------------------------------------------------: | :-----------------------------------------------: |
| <img src="captures/heeyeon.png" width="120"> | <img src="captures/xezixx.png" width="120" /> |
|    **[최희연](https://github.com/heeyeon9578)**     |      **[정예지](https://github.com/xEzIxX)**      |

---
