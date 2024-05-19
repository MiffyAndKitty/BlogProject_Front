import React from 'react';
import Header from './structure/Header';
import Footer from './structure/Footer';

const Dashboard: React.FC = () => {
  return (
    <div className="App">
      <Header />
      <main>
        <h2>대시보드</h2>
        <p>대시보드 콘텐츠가 여기에 들어갑니다.</p>
      </main>
      <Footer />
    </div>
  )
};

export default Dashboard;
