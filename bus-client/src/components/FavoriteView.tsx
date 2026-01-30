import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import useAxios from '../hooks/useAxios';
import styled from '@emotion/styled';
import ArrivalInfo from './ArrivalInfo';


interface Station {
    id?: number;
    stationId: string;
    stationName: string;
    arsId: string;
    adirection?: string;
}

const HomeViewWrapper = styled.div`
    padding-top: 100px; /* 헤더 + 메뉴 높이만큼 패딩 추가 */
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    overflow-y: auto;
`;

const StationList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
`;

const StationItem = styled.li`
    padding: 0;
    width: 100%;
    /* height: 50px;  <- 고정 높이 제거 */
    border-bottom: 1px solid #eaeaea;
    
    /* 내부 요소들을 세로로 배치 (헤더 + 상세정보) */
    display: flex;
    flex-direction: column;
`;

// 기존의 '한 줄' 역할을 하는 헤더 영역
const StationHeader = styled.div`
    width: 100%;
    height: 50px; /* 높이는 여기에 지정 */
    display: flex;
    align-items: center;
    justify-content: space-between;
    cursor: pointer;
    background-color: #fff;
    transition: background-color 0.2s;

    &:hover {
        background-color: #f9f9f9;
    }
`;

// 삭제 버튼 스타일
const DeleteButton = styled.button`
    background: none;
    border: 1px solid #ff6b6b;
    color: #ff6b6b;
    border-radius: 4px;
    padding: 5px 10px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
        background-color: #ff6b6b;
        color: white;
    }
`;

// 클릭 시 나타날 상세 정보 영역 스타일
const DetailArea = styled.div`
    width: 100%;
    height: 500px;
    overflow-y: auto;
    padding: 20px;
    background-color: #f1f3f5; /* 약간 회색 배경으로 구분 */
    box-sizing: border-box;
    font-size: 0.9rem;
    color: #495057;
    
    /* 애니메이션 효과 (선택사항) */
    animation: fadeIn 0.3s ease-in-out;
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-5px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;

const FavoriteView:React.FC = () => {
    const { 
        data: stations, 
        loading: isListLoading, 
        error: listError,
        refetch
    } = useAxios<Station[]>('http://localhost:8080/api/stations');

    // ✨ 현재 확장된(열린) 정류장의 ID를 저장하는 state
    // null이면 아무것도 안 열린 상태
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // 클릭 핸들러: 이미 열려있으면 닫고, 아니면 엽니다.
    const handleItemClick = (id: string) => {
        if (expandedId === id) {
            setExpandedId(null); // 이미 열린거 클릭하면 닫기
        } else {
            setExpandedId(id); // 클릭한거 열기
        }
    };

    // 삭제 핸들러
    const handleDelete = async (e: React.MouseEvent, station: Station) => {
        // 1. 이벤트 전파 중단: 이게 없으면 삭제 버튼 누를 때 목록이 펼쳐집니다.
        e.stopPropagation();

        if (!window.confirm(`'${station.stationName}'을(를) 삭제하시겠습니까?`)) {
            return;
        }

        try {
            // DB의 ID(id) 혹은 정류장 ID(stationId) 중 백엔드가 요구하는 것을 사용하세요.
            // 여기서는 id가 있다면 id를, 없으면 stationId를 사용하도록 예시를 들었습니다.
            // 백엔드 API가 /api/stations/{id} 형태라고 가정합니다.
            const targetId = station.id || station.stationId;

            await axios.delete(`http://localhost:8080/api/stations/${targetId}`);
            
            alert("삭제되었습니다.");
            refetch(); // 목록 새로고침
        } catch (error) {
            console.error("삭제 실패:", error);
            alert("삭제 중 오류가 발생했습니다.");
        }
    };

    if (stations === null) return <div>정류장 정보가 없습니다.</div>;
    if (isListLoading && (!stations || stations.length ===0)) return <div>로딩 중...</div>;
    if (listError) return <div>오류 발생: {listError}</div>;

    return (
        <HomeViewWrapper>
            {/* 목록 렌더링... */}
            <StationList>
                {stations?.map(station => (
                    <StationItem key={station.stationId}>
                        <StationHeader onClick={() => handleItemClick(station.stationId)}>
                        {station.stationName} ({station.arsId})
                            <DeleteButton onClick={(e) => handleDelete(e, station)}>
                                삭제
                            </DeleteButton>
                        </StationHeader>

                        {expandedId === station.stationId && (
                            <DetailArea>
                                {/* ✨ 여기에 ArrivalInfo 컴포넌트를 넣습니다! */}
                                {/* arsId만 넘겨주면 나머지는 알아서 처리합니다 */}
                                <ArrivalInfo 
                                    arsId={station.arsId} 
                                    stationName={station.stationName}
                                />
                            </DetailArea>
                        )}
                    </StationItem>
                ))}
            </StationList>
        </HomeViewWrapper>
    );
}

export default FavoriteView;