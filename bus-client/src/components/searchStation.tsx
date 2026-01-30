import React from 'react';
import styled from '@emotion/styled';
import { MdSearch } from 'react-icons/md';

const FooterContainer = styled.footer`
    width: 100%;
    max-width: 800px;
    text-align: center;
    padding: 10px;
    position: fixed;
    top: 100px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 0.9rem;
    color: #666;
`;

const InputWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 10px;
    margin: 0 10px;
    border-radius: 8px;
    background-color: white;
    box-sizing: border-box;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);

`;

const SearchInput = styled.input`
    flex-grow: 1; /* 남은 공간을 모두 차지 */
    border: none;
    outline: none;
    padding: 0; /* Wrapper가 패딩을 담당하므로 제거 */
    font-size: 1rem;
    background: none; /* 배경 투명 */
    
    ::placeholder {
        color: #aaa;
    }
`;

const SearchIcon = styled(MdSearch)`
    margin-right: 8px;
    color: #666;
    font-size: 1.2rem;
    flex-shrink: 0; /* 아이콘 크기 고정 */

    /* 클릭 가능 표시 */
    cursor: pointer; 
    
    /* 마우스 올렸을 때 진하게 */
    &:hover {
        color: #333; 
    }
`;

interface SearchStationProps {
    value: string;                     // 현재 검색어 (myKeyword)
    onChange: (newKeyword: string) => void; // 검색어 변경 함수 (setMyKeyword)
    onSearch?: (keyword: string) => void;
}

const SearchStation: React.FC<SearchStationProps> = ({ value, onChange, onSearch }) => {
    return (
        <FooterContainer>
            <InputWrapper>
                <SearchInput 
                    placeholder="내 목록에서 즉시 검색..."
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                />
                <SearchIcon onClick={() => onSearch && onSearch(value)} />
            </InputWrapper>
        </FooterContainer>
    );
};

export default SearchStation;
