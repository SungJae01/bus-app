import React from 'react';
import styled from '@emotion/styled';
import ArrivalInfo from './ArrivalInfo';

interface Props {
    isOpen: boolean;
    onClose: () => void;
    selectedStation: any | null; 
    onSelect: (station: any) => void;
}

const SheetContainer = styled.div<{ isOpen: boolean }>`
    position: fixed;
    bottom: 0; left: 0; right: 0;
    height: 40vh; /* 화면의 60% 높이 */
    background-color: white;
    border-top-left-radius: 20px;
    border-top-right-radius: 20px;
    box-shadow: 0 -5px 20px rgba(0,0,0,0.2);
    transform: translateY(${props => props.isOpen ? '0' : '100%'});
    transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1); /* 부드러운 애니메이션 */
    z-index: 1000;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* 내부 스크롤을 위해 */
`;

// 상단 컨트롤 바 (저장 버튼, 닫기 버튼)
// 정류장 이름은 ArrivalInfo 안에 있으므로 여기선 버튼만 배치합니다.
const ControlBar = styled.div`
    position: absolute;
    top: 15px;
    right: 15px;
    z-index: 20; /* ArrivalInfo 헤더보다 위에 떠있어야 함 */
    display: flex;
    gap: 10px;
`;

const ActionButton = styled.button`
    background-color: #4a7eaf;
    color: white;
    border: none;
    padding: 8px 12px;
    border-radius: 20px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    transition: transform 0.1s;

    &:active {
        transform: scale(0.95);
    }

    &:focus {
        outline: none;
    }
`;

const ContentWrapper = styled.div`
    flex: 1;
    overflow: hidden; /* ArrivalInfo 내부에서 스크롤 */
    position: relative;
`;

const SearchResultSheet: React.FC<Props> = ({ isOpen, onClose, selectedStation, onSelect }) => {
    // 선택된 정보가 없으면 렌더링 X
    if (!selectedStation) return null;

    return (
        <SheetContainer isOpen={isOpen}>
            {/* 1. 우측 상단 둥둥 떠있는 버튼들 */}
            <ControlBar>
                <ActionButton onClick={() => onSelect(selectedStation)}>
                    ⭐ 저장
                </ActionButton>
            </ControlBar>

            {/* 2. 메인 컨텐츠 (도착 정보) */}
            <ContentWrapper>
                <ArrivalInfo 
                    key={selectedStation.arsId} 
                    arsId={selectedStation.arsId} 
                    stationName={selectedStation.stNm} 
                />
            </ContentWrapper>
        </SheetContainer>
    );
};

export default SearchResultSheet;