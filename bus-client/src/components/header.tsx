import React from 'react';
import styled from '@emotion/styled';
import { MdMenu, MdNotificationsNone } from 'react-icons/md';

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

// ✨ 3. 아이콘 버튼을 위한 스타일 컴포넌트 추가
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

interface HeaderProps {
    // 나중에 메뉴 클릭 이벤트 등을 props로 받을 수 있습니다.
    onMenuClick?: () => void;
    onAlarmClick?: () => void;
}

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