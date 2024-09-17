import React, { useState } from 'react';
import type { SVGProps } from 'react';
import './QuestionMark.css';

type QuestionMarkType = 'Follow' | 'tag';

interface QuestionMarkProps extends SVGProps<SVGSVGElement> {
  type: QuestionMarkType;
}

export function QuestionMark({ type, ...props }: QuestionMarkProps) {
  const [isHovered, setIsHovered] = useState(false);

  // 타입에 따른 메시지 정의
  const TAG_MESSAGE = `특정 시간대에 인기태그가 없다면 \n대체태그가 보여지며, 회색으로 표시됩니다.`;
  const FOLLOW_MESSAGE = `회색 테두리로 표시된 블로거는 10명을 채우기 위해 \n 무작위로 추천된 대체 블로거입니다.`;

  // 메시지 결정
  const tooltipMessage = type === 'tag' ? TAG_MESSAGE : FOLLOW_MESSAGE;

  return (
    <div 
      className="question-mark-container"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24" {...props}>
        <g fill="none" stroke="#FF88D7" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}>
          <path strokeDasharray={64} strokeDashoffset={64} d="M12 3c4.97 0 9 4.03 9 9c0 4.97 -4.03 9 -9 9c-4.97 0 -9 -4.03 -9 -9c0 -4.97 4.03 -9 9 -9Z">
            <animate fill="freeze" attributeName="stroke-dashoffset" dur="0.6s" values="64;0"></animate>
          </path>
          <path strokeDasharray={16} strokeDashoffset={16} d="M9 10c0 -1.66 1.34 -3 3 -3c1.66 0 3 1.34 3 3c0 0.98 -0.47 1.85 -1.2 2.4c-0.73 0.55 -1.3 0.6 -1.8 1.6">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.6s" dur="0.2s" values="16;0"></animate>
          </path>
          <path strokeDasharray={2} strokeDashoffset={2} d="M12 17v0.01">
            <animate fill="freeze" attributeName="stroke-dashoffset" begin="0.8s" dur="0.2s" values="2;0"></animate>
          </path>
        </g>
      </svg>
      {isHovered && (
        <div className={type === 'tag' ? "tooltip":'tooltip-follow'}>
          {tooltipMessage.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}
    </div>
  );
}