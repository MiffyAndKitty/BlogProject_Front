import React from 'react';
import Header from '../structure/Header';
import Footer from '../structure/Footer';

const FindLoginID: React.FC = () => {
  return (
    <div className="App">
    <Header pageType="signup"/>
    <main>
      로그인 아이디 찾기
    </main>
    <Footer />
  </div>
  )
};

export default FindLoginID;
