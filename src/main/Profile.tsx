// Import the functions you need from the SDKs you need
import { useNavigate } from "react-router-dom";
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";
import React from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';

const firebaseConfig = {
  apiKey: "AIzaSyCfoepTZGKKL7SubUSCy81pHHag-vDSWmY",
  authDomain: "mk-blog-e88c8.firebaseapp.com",
  projectId: "mk-blog-e88c8",
  storageBucket: "mk-blog-e88c8.appspot.com",
  messagingSenderId: "329301984688",
  appId: "1:329301984688:web:f7e2819bdd730419a64275",
  measurementId: "G-KGMPV32SSK"
};
console.log(firebaseConfig);

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Auth 참조 가져오기
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const Profile: React.FC = () => {
  const navigate = useNavigate();

  const signInWithGoogle = () => {
    signInWithPopup(auth, provider)
      .then((result) => {
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential && credential.accessToken) {
          localStorage.setItem('accessToken', credential.accessToken);
          console.log(result.user);
          navigate(`/dashboard`);
        } else {
          console.error('No accessToken or credential returned from Google login.');
        }
      })
      .catch((error) => {
        console.error(error);
      });
  };
  const goToSignUp = () => {
    navigate(`/signup`);
  };

  const goToLogin = () => {
    navigate(`/login`);
  };
  return (
    <div className="App">
      <Header/>
      <main>
        <button onClick={goToLogin}>로그인</button>
        <button onClick={goToSignUp}>회원가입</button>
        <button onClick={signInWithGoogle}>구글 로그인</button>
      </main> 
      <Footer />
    </div>
  );
};

export default Profile;

// export const signInWithGoogle = () => {
//   const navigate = useNavigate();
//   signInWithPopup(auth, provider)
//     .then((result) => {
//       // Google 로그인 후 credential 추출
//       const credential = GoogleAuthProvider.credentialFromResult(result);
//       if (credential) {
//         // credential이 null이 아닌 경우에만 처리
//         const accessToken: string | undefined = credential.accessToken;  // accessToken 추출
//         if (accessToken) {
//           localStorage.setItem('accessToken', accessToken); // localStorage에 accessToken 저장
//           console.log(result.user);
//           navigate(`/dashboard`)
//         } else {
//           console.error('No accessToken returned from Google login.');
//         }
//       } else {
//         // credential이 null인 경우
//         console.error('No credentials returned from Google login.');
//       }
//     })
//     .catch((error) => {
//       // 에러 처리
//       console.error(error);
//     });
// };
