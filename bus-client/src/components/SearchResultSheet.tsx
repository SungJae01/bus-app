import React from 'react';
import styled from '@emotion/styled';
import { MdClose, MdDirectionsBus } from 'react-icons/md';

// 1. 반투명 배경 (클릭 시 닫힘)
const Backdrop = styled.div<{ isOpen: boolean }>`
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 900;
    display: ${(props) => (props.isOpen ? 'block' : 'none')};
    opacity: ${(props) => (props.isOpen ? 1 : 0)};
    transition: opacity 0.3s;
`;

// 2. 바텀 시트 (흰색 박스)
const SheetContainer = styled.div<{ isOpen: boolean }>`
    position: fixed;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%) translateY(${(props) => (props.isOpen ? '0' : '100%')});
    
    width: 100%;
    max-width: 800px;
    height: 50vh; /* 화면의 50% 높이 */
    
    background-color: white;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.2);
    z-index: 1000;
    transition: transform 0.3s ease-in-out;
    display: flex;
    flex-direction: column;
`;

// 3. 헤더 (제목 + 닫기 버튼)
const SheetHeader = styled.div`
    padding: 15px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 1.1rem;
        color: #333;
    }
`;

// 4. 스크롤 가능한 리스트 영역
const ListArea = styled.ul`
    flex: 1;
    overflow-y: auto;
    margin: 0;
    padding: 0;
    list-style: none;
`;

// 5. 개별 리스트 아이템
const ListItem = styled.li`
    padding: 15px 20px;
    border-bottom: 1px solid #f5f5f5;
    cursor: pointer;
    display: flex;
    align-items: center;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f0f7ff;
    }

    .icon-box {
        width: 40px;
        height: 40px;
        background-color: #e3f2fd;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        color: #2196F3;
        font-size: 1.2rem;
    }

    .info {
        display: flex;
        flex-direction: column;
        
        strong {
            font-size: 1rem;
            color: #333;
            margin-bottom: 4px;
        }
        
        span {
            font-size: 0.85rem;
            color: #888;
        }
    }
`;

const CloseButton = styled.button`
    background: none;
    border: none;
    cursor: pointer;
    font-size: 1.5rem;
    color: #999;
    padding: 5px;
    
    &:hover { color: #333; }
`;

// 데이터 타입 정의
interface Station {
    stNm: string;
    arsId: string;
    stId: string;
    tmX?: string;
    tmY?: string;
}

interface Props {
    isOpen: boolean;
    onClose: () => void;
    results: Station[];
    onSelect: (station: Station) => void;
}

const SearchResultSheet: React.FC<Props> = ({ isOpen, onClose, results, onSelect }) => {
    return (
        <>
            {/* 배경 클릭 시 닫힘 */}
            <Backdrop isOpen={isOpen} onClick={onClose} />
            
            <SheetContainer isOpen={isOpen}>
                <SheetHeader>
                    <h3>검색 결과 ({results.length})</h3>
                    <CloseButton onClick={onClose}>
                        <MdClose />
                    </CloseButton>
                </SheetHeader>

                <ListArea>
                    {results.length === 0 ? (
                        <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                            검색 결과가 없습니다.
                        </div>
                    ) : (
                        results.map((station, index) => (
                            <ListItem key={`${station.stId}_${index}`} onClick={() => onSelect(station)}>
                                <div className="icon-box">
                                    <MdDirectionsBus />
                                </div>
                                <div className="info">
                                    {/* 정류장 이름 */}
                                    <strong>{station.stNm}</strong>
                                    {/* ARS ID와 관리 ID 표시 */}
                                    <span>ARS: {station.arsId} | ID: {station.stId}</span>
                                </div>
                            </ListItem>
                        ))
                    )}
                </ListArea>
            </SheetContainer>
        </>
    );
};

export default SearchResultSheet;