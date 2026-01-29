import React from 'react';
import styled from '@emotion/styled';
import { MdMenu, MdNotificationsNone } from 'react-icons/md';

// Emotion 을 활용한 <header> 시멘틱 태그 스타일링
const HeaderContainer = styled.header`
    width: 100%;
    height: 50px;
    background-color: #ffffff;
    color: black;
    position: fixed;
    top: 0;
    left: 0;
    border-bottom: 1px solid #eaeaea;
    z-index: 100;

    display: flex;
    justify-content: space-between; // 양쪽 끝으로 밀어내기
    align-items: center; // 수직 중앙 정렬
    padding: 0 16px; // 좌우 여백 추가
    box-sizing: border-box; // padding이 width에 포함되도록 설정

    // .header-title (가운데 제목) 스타일링
    h1 {
        margin: 0;
        font-size: 1.1rem;
        font-weight: bold;
        flex-grow: 1;
        text-align: center;
    }
`;

// 아이콘 버튼을 위한 스타일 컴포넌트 추가
const IconButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    padding: 8px; // 클릭 영역 확보
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem; // 아이콘 크기
    color: #333; // 아이콘 색상
    border-radius: 50%; // 동그란 클릭 효과를 위해
    transition: background-color 0.2s;

    &:focus {
        outline: none;
    }

    &:hover {
        background-color: rgba(0, 0, 0, 0.05); // 마우스 올렸을 때 살짝 회색 배경
    }
`;

// TypeScript 인터페이스 정의
// 인터페이스란 컴포넌트가 받을 props의 타입을 정의하는 역할을 합니다.
// OnMenuClick과 OnAlarmClick은 각각 메뉴 버튼과 알람 버튼 클릭 시 호출될 함수 타입입니다.
// 물음표(?)는 해당 props가 선택적(optional)임을 나타냅니다.
interface HeaderProps {
    // 나중에 메뉴 클릭 이벤트 등을 props로 받을 수 있습니다.
    onMenuClick?: () => void;
    onAlarmClick?: () => void;
}

// Header 컴포넌트 정의
// React.FC는 Function Component의 약자입니다.
// 제네릭으로 HeaderProps를 전달하여 props의 타입을 지정합니다.
// Header 컴포넌트는 위에서 정의한 HeaderProps 타입의 props를 받습니다.
const Header: React.FC<HeaderProps> = ({ onMenuClick, onAlarmClick }) => {
    return (
        <HeaderContainer>
            {/* 왼쪽: 햄버거 메뉴 버튼 */}
            <IconButton onClick={onMenuClick} aria-label="메뉴 열기">
                <MdMenu />
            </IconButton>
            
            {/* 가운데: 제목 */}
            <h1>나만의 서울 버스</h1>
            
            {/* 오른쪽: 알람 버튼 */}
            <IconButton onClick={onAlarmClick} aria-label="알림 보기">
                <MdNotificationsNone />
            </IconButton>
        </HeaderContainer>
    );
};

export default Header;