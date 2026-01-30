import React, { useState } from 'react';
import { useEffect } from 'react';
import axios from 'axios';
// ✨ 네이버 지도 컴포넌트들 import
import { Container as MapDiv, NaverMap, Marker, useNavermaps, Listener } from 'react-naver-maps';
import styled from '@emotion/styled';
import SearchStation from './SearchStation';
import SearchResultSheet from './SearchResultSheet';

interface SearchViewProps {
    onStationSaved: () => void;
}

// 하버사인 공식 (두 좌표 사이의 거리 계산)
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const R = 6371; // 지구 반지름 (km)
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c * 1000; // km를 m로 변환
    return distance; // 미터(m) 단위 반환
}

// 스타일은 기존과 동일
const MapContainer = styled.div`
    position: absolute; top: 0; left: 0; width: 100%; height: 100%; z-index: 0;
`;
const SearchBarWrapper = styled.div`
    position: absolute; top: 10px; left: 10px; right: 10px; z-index: 10;
`;

const MyLocationBtn = styled.button`
    position: absolute;
    bottom: 30px; /* 하단에서 30px 띄움 */
    right: 20px;  /* 우측에서 20px 띄움 */
    z-index: 50;  /* 지도보다 위에 있어야 함 */
    
    width: 45px;
    height: 45px;
    background-color: white;
    border: none;
    border-radius: 50%; /* 동그라미 모양 */
    padding: 0;
    box-shadow: 0 2px 6px rgba(0,0,0,0.3); /* 그림자 효과 */
    cursor: pointer;
    
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem; /* 아이콘 크기 */
    color: #333;
    transition: background-color 0.2s;

    &:active {
        background-color: #f1f3f5;
    }

    &:focus {
        outline: none;
    }
`;

const SearchView: React.FC<SearchViewProps> = ({ onStationSaved }) => {
    // 네이버 지도는 좌표 객체를 쓰기 위해 훅이 필요할 수 있음
    const navermaps = useNavermaps();

    // 중심 좌표 & 줌 레벨 (네이버는 'zoom'을 씁니다. 보통 15~17 정도가 적당)
    const [center, setCenter] = useState({ lat: 37.554678, lng: 126.970606 });
    const [zoom, setZoom] = useState(15);

    // 내 위치 저장할 state
    const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);

    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [searchKeyword, setSearchKeyword] = useState('');
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    const [selectedStation, setSelectedStation] = useState<any | null>(null);

    useEffect(() => {
        // 브라우저가 위치 정보를 지원하는지 확인
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    
                    const newPos = { lat, lng };
                    
                    setMyLocation(newPos); // 내 위치 마커용
                    setCenter(newPos);     // 지도 중심 이동
                    setZoom(17);           // 확대
                    
                    console.log("📍 내 위치 발견:", newPos);
                },
                (error) => {
                    console.error("위치 정보를 가져올 수 없습니다:", error);
                    // 위치 권한 거부 등의 경우 그냥 기본값(서울역) 유지
                }
            );
        } else {
            alert("이 브라우저는 위치 정보를 지원하지 않습니다.");
        }
    }, []); // 빈 배열: 처음에 딱 한 번만 실행

    // 공공데이터 검색 로직
    const handleSearch = async (input?: React.FormEvent | string) => {
        if (input && typeof input !== 'string') input.preventDefault();
        const targetKeyword = typeof input === 'string' ? input : searchKeyword;
        if (!targetKeyword) return;

        try {
            const res = await axios.get(`http://localhost:8080/api/stations/search?keyword=${targetKeyword}`);
            const data = res.data;
            const msgBody = data.msgBody || data.ServiceResult?.msgBody || data.response?.msgBody;
            const items = msgBody?.itemList;
            let finalItems = items ? (Array.isArray(items) ? items : [items]) : [];

            // 내 위치가 있다면, 거리 순으로 정렬하기
            if (myLocation && finalItems.length > 0) {
                // (1) 각 아이템에 'distance' 정보를 미리 계산해서 넣음 (선택사항이지만 추천)
                finalItems = finalItems.map((item: any) => {
                    const lat = parseFloat(item.tmY);
                    const lng = parseFloat(item.tmX);
                    // 거리 계산
                    const dist = getDistance(myLocation.lat, myLocation.lng, lat, lng);
                    return { ...item, dist }; // 기존 데이터에 dist(거리) 추가
                });

                // (2) 거리가 짧은 순서대로(오름차순) 정렬
                finalItems.sort((a: any, b: any) => a.dist - b.dist);
            }

            setSearchResults(finalItems);

            if (finalItems.length > 0) {

                // 첫 번째 결과로 지도 이동
                const firstResult = finalItems[0];
                const lat = parseFloat(firstResult.tmY);
                const lng = parseFloat(firstResult.tmX);

                if (!isNaN(lat) && !isNaN(lng)) {
                    setCenter({ lat, lng });
                    setZoom(17); // 검색했으니 좀 더 확대해서 보여주기
                }
            } else {
                alert("검색 결과가 없습니다.");
            }
        } catch (error) {
            console.error("검색 오류:", error);
            alert("검색 중 오류가 발생했습니다.");
        }
    };
    
    // 정류장 선택 및 DB 저장 로직
    const handleSelectStation = async (station: any) => {
        // 사용자 확인 (선택 사항)
        const confirmSave = window.confirm(`'${station.stNm}' 정류장을 저장하시겠습니까?`);
        if (!confirmSave) return;

        let direction = ""; 

        try {
            // (1) 방면 정보를 얻기 위해 도착 API 조회
            console.log(`🔍 [${station.stNm}] 방면 정보 조회 중...`);
            const res = await axios.get(`http://localhost:8080/api/stations/arrival?arsId=${station.arsId}`);
            const items = res.data?.msgBody?.itemList || res.data?.response?.msgBody?.itemList;
            
            if (items) {
                const firstItem = Array.isArray(items) ? items[0] : items;
                if (firstItem?.adirection) {
                    direction = firstItem.adirection;
                }
            }
        } catch (error) {
            console.warn("방면 정보 조회 실패 (무시하고 진행):", error);
        }

        // (2) DB에 저장할 데이터 구성
        const payload = {
            stationName: station.stNm,
            stationId: station.stId,
            arsId: station.arsId,
            adirection: direction, // 조회한 방면 정보
        };

        try {
            // (3) 백엔드로 저장 요청
            await axios.post('http://localhost:8080/api/stations', payload);
            
            alert(`✅ '${station.stNm}' 저장 완료!`);
            setIsSheetOpen(false); // 시트 닫기
            
            // (4) 부모 컴포넌트(App.tsx)에 알려서 목록 새로고침
            onStationSaved(); 

        } catch (error) {
            console.error("저장 실패:", error);
            alert("저장에 실패했습니다. (이미 저장된 정류장일 수 있습니다)");
        }
    };

    const handleMoveToCurrentPosition = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const lat = position.coords.latitude;
                    const lng = position.coords.longitude;
                    const newPos = { lat, lng };
                    
                    setMyLocation(newPos); // 1. 내 위치 마커 갱신
                    setCenter(newPos);     // 2. 지도 중심 이동
                    setZoom(17);           // 3. 줌 확대
                },
                (error) => {
                    console.error("위치 에러:", error);
                    alert("현재 위치를 가져올 수 없습니다.");
                },
                { enableHighAccuracy: true } // 정확도 높임
            );
        } else {
            alert("위치 정보를 지원하지 않는 브라우저입니다.");
        }
    };

    return (
        <>
            <SearchBarWrapper>
                <SearchStation
                    value={searchKeyword}
                    onChange={setSearchKeyword}
                    onSearch={handleSearch}
                />
            </SearchBarWrapper>
            <MapContainer>
                <MapDiv style={{ width: '100%', height: '100%' }}>
                    <NaverMap
                        center={center}
                        zoom={zoom}
                        onZoomChanged={(zoom) => setZoom(zoom)} // 줌 변경 시 상태 동기화
                        onCenterChanged={(center) => setCenter(center)} // 이동 시 상태 동기화
                    >
                        <Listener 
                            type="click" 
                            listener={() => {
                                setIsSheetOpen(false);      // 시트 닫기
                                setSelectedStation(null);   // 선택 해제
                            }} 
                        />

                        {/* 내 위치 마커 (빨간색) */}
                        {myLocation && (
                            <Marker
                                position={myLocation}
                                // 마커 아이콘을 빨간색으로 변경 (네이버 기본 제공 아이콘 활용)
                                icon={{
                                    content: `
                                        <div style="
                                            width: 10px; 
                                            height: 10px; 
                                            background: red; 
                                            border: 2px solid white; 
                                            border-radius: 50%; 
                                            box-shadow: 0 0 5px rgba(0,0,0,0.5);
                                        "></div>
                                    `,
                                    anchor: new navermaps.Point(10, 10), // 중심점 맞추기
                                }}
                                onClick={() => alert("현재 내 위치입니다!")}
                            />
                        )}

                        {/* 검색 결과 마커들 */}
                        {searchResults.map((station, index) => {
                            const lat = parseFloat(station.tmY);
                            const lng = parseFloat(station.tmX);
                            if (isNaN(lat) || isNaN(lng)) return null;

                            return (
                                <Marker
                                    key={`${station.arsId}-${index}`}
                                    position={{ lat, lng }}
                                    onClick={(e) => {
                                        setCenter({ lat, lng });
                                        setSelectedStation(station);
                                        setIsSheetOpen(true);
                                    }}
                                />
                            );
                        })}
                    </NaverMap>
                </MapDiv>
            </MapContainer>
            <MyLocationBtn onClick={handleMoveToCurrentPosition} title="내 위치로 이동">
                ◎ {/* 아이콘 대신 특수문자 사용 (또는 이미지) */}
            </MyLocationBtn>
            <SearchResultSheet
                isOpen={isSheetOpen}
                onClose={() => setIsSheetOpen(false)}
                selectedStation={selectedStation}
                onSelect={handleSelectStation}
            />
        </>
    );
};

export default SearchView;