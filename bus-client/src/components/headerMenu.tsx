import React from 'react';
import styled from '@emotion/styled';

const Nav = styled.nav`
    width: 100%;
    height: 50px;
    background-color: #ffffff;
    border-bottom: 1px solid #eaeaea;
    box-sizing: border-box;
    padding: 0;
    position: fixed;
    margin: auto;
    top: 50px; /* 헤더 높이만큼 아래로 위치 */
    left: 0;
    
    z-index: 99;

    ul {
        list-style: none;
        display: flex;
        justify-content: space-around;
        margin: 0;
        padding: 0;
    }

    li {
        height: 50px;
        display: flex;
        flex: 1;
        align-items: center;
        justify-content: center;
        }

    li:hover {
        background-color: #f5f5f5;
    }
`;

// menuName: 어떤 메뉴가 클릭되었는지 나타내는 문자열
// void: 반환값이 없음을 나타냄
interface HeaderMenuProps {
    // 부모(App)에게 "어떤 메뉴가 클릭되었는지" 알려주는 함수
    onMenuSelect: (menuName: string) => void;
}

const HeaderMenu: React.FC <HeaderMenuProps> = ({ onMenuSelect}) => {

    // 이벤트 위임 핸들러
    const handleMenuClick = ( e: React.MouseEvent<HTMLUListElement>) => {
        // 클릭된 요소(target)가 <li> 인지 확인 (혹은 li 내부의 태그인지)
        // closest 메서드를 사용하여 가장 가까운 li 요소를 찾음
        // 사용자는 <li> 전체를 눌렀다고 생각하지만 실제로는 태그 안에 <span> 이나 <a> 등을 클릭했을 수 있음
        // 그렇기 때문에 e.target은 <li>가 아니라 <span>이 된다.
        // 그래서 closest('li')를 사용해서 나 자신을 포함해 위쪽으로 거슬러 올라가면서 가장 먼저 만나는 <li> 태그를 찾는다.
        // 여기서 HTMLElement는 일반적인 이벤트 타겟이 아니고 HTML 태그가 맞다고 타입을 선언해주고 HTML 관련 함수를 쓸 수 있게 해준다.
        const target = (e.target as HTMLElement).closest('li');

        // 만약 li가 아니거나, data-menu 속성이 없으면 무시
        if (!target || !target.dataset.menu) return;

        // dataset에서 메뉴 이름 꺼내기
        const menuName = target.dataset.menu;

        // 부모에게 클릭된 메뉴 이름 전달
        onMenuSelect(menuName);
    }
    return (
        <Nav>
            <ul onClick={handleMenuClick}>
                <li data-menu="home">홈</li>
                <li data-menu="search">검색</li>
                <li data-menu="favorites">즐겨찾기</li>
                <li data-menu="settings">설정</li>
            </ul>
        </Nav>
    );
};

export default HeaderMenu;