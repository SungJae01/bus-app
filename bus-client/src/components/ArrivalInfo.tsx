import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import styled from '@emotion/styled';

// ✨ [수정] 부모로부터 이름(stationName)도 함께 받습니다.
interface Props {
    arsId: string;
    stationName: string; // 추가된 prop
}

interface BusArrival {
    rtNm: string; adirection: string; arrmsg1: string; arrmsg2: string;
    busType1: string; reride_Num1: string; isLast1: string; routeType: string;
    stNm: string; nxtStn: string;
}

// ... (스타일 컴포넌트들은 기존과 동일하므로 생략, 그대로 두세요!) ...
// Container, StationHeader, StationTitle, StationIdBadge 등...
// 아래 스타일 코드가 필요하면 이전 답변을 참고하거나 그대로 두시면 됩니다.

const Container = styled.div` display: flex; flex-direction: column; height: 100%; `;
const StationHeader = styled.div` background-color: white; padding: 20px; border-bottom: 1px solid #f1f3f5; position: sticky; top: 0; z-index: 10; `;
const StationTitle = styled.h2` margin: 0; font-size: 1.4rem; color: #333; display: flex; align-items: center; gap: 8px; `;
const StationIdBadge = styled.span` font-size: 0.8rem; color: #868e96; background-color: #f1f3f5; padding: 2px 6px; border-radius: 4px; font-weight: normal; `;
const DirectionInfo = styled.div` margin-top: 10px; font-size: 0.95rem; color: #495057; display: flex; align-items: center; gap: 10px; `;
const NextStationBadge = styled.span` color: #228be6; font-weight: bold; background-color: #e7f5ff; padding: 4px 8px; border-radius: 12px; font-size: 0.85rem; `;
const RefreshTime = styled.div` font-size: 0.75rem; color: #adb5bd; text-align: right; margin-top: 5px; `;
const BusList = styled.ul` list-style: none; padding: 0; margin: 0; flex: 1; overflow-y: auto; `;
const BusItem = styled.li` display: flex; justify-content: space-between; align-items: center; padding: 15px 20px; border-bottom: 1px solid #f1f3f5; &:last-child { border-bottom: none; } `;
const BusNumber = styled.div<{ type: string }>` font-size: 1.2rem; font-weight: bold; color: ${props => props.type === '3' ? '#339af0' : props.type === '4' ? '#51cf66' : props.type === '5' ? '#fcc419' : props.type === '6' ? '#fa5252' : '#333'}; margin-bottom: 4px; `;
const BusMsg = styled.div` font-size: 1rem; color: #d6336c; font-weight: bold; text-align: right; `;
const SubMsg = styled.div` font-size: 0.8rem; color: #868e96; text-align: right; margin-top: 2px; `;


const ArrivalInfo: React.FC<Props> = ({ arsId, stationName }) => {
    const [buses, setBuses] = useState<BusArrival[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<string>('');
    
    // 추가 정보 (다음 정류장, 방면)
    const [extraInfo, setExtraInfo] = useState({ nextStation: '', direction: '' });

    const fetchArrivals = useCallback(async (isBackground = false) => {

        if (!isBackground) setLoading(true);

        setLoading(true);
        try {
            const res = await axios.get(`http://localhost:8080/api/stations/arrival?arsId=${arsId}`);
            const data = res.data;
            const items = data.msgBody?.itemList || data.response?.msgBody?.itemList;
            const busList = items ? (Array.isArray(items) ? items : [items]) : [];
            
            setBuses(busList);
            console.log("도착 정보 갱신 완료:", busList);

            if (busList.length > 0) {
                setExtraInfo({
                    nextStation: busList[0].nxtStn,
                    direction: busList[0].adirection,
                });
            }

            // ✨ [핵심] 데이터 가져오기 성공하면 시간 갱신!
            const now = new Date();
            // 보기 좋게 시:분:초 포맷팅
            const timeString = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
            setLastUpdated(timeString);

        } catch (err) {
            setError('정보를 불러오지 못했습니다.');
        } finally {
            setLoading(false);
        }
    }, [setLoading, setLastUpdated]);

    // 10초마다 갱신
    useEffect(() => {
        if (arsId) {
            fetchArrivals(false); // 첫 실행 (로딩 O)

            const interval = setInterval(() => {
                fetchArrivals(true); // 10초 뒤 실행 (로딩 X, 시간 갱신 O)
            }, 10000);

            return () => clearInterval(interval);
        }
    }, [arsId, fetchArrivals]);

    const getCrowding = (code: string) => { /* ... 기존과 동일 ... */ 
        if (code === '5') return '혼잡'; if (code === '4') return '보통'; return '여유';
    };

    return (
        <Container>
            {/* ✨ 1. 상단: 이미 알고 있는 정보(이름, ID) 바로 표시 */}
            <StationHeader>
                <StationTitle>
                    {stationName} 
                    <StationIdBadge>{arsId}</StationIdBadge>
                </StationTitle>
                
                {/* 로딩 중일 때도 이름은 떠있고, 이 부분만 나중에 채워짐 */}
                <DirectionInfo>
                    {extraInfo.nextStation ? (
                        <>
                            <NextStationBadge>{extraInfo.nextStation}</NextStationBadge>
                            <span>방향</span>
                            <span style={{color: '#868e96', fontSize: '0.8rem', marginLeft: '5px'}}>
                                ({extraInfo.direction} 방면)
                            </span>
                        </>
                    ) : (
                        <span style={{color: '#ccc', fontSize: '0.8rem'}}>방면 정보 확인 중...</span>
                    )}
                </DirectionInfo>

                {lastUpdated && <RefreshTime>⏱ {lastUpdated}</RefreshTime>}
            </StationHeader>

            {/* ✨ 2. 하단: 버스 목록 (로딩 처리) */}
            <BusList>
                {loading && buses.length === 0 ? (
                    <div style={{padding: 40, textAlign: 'center', color: '#999'}}>
                        🚌 실시간 정보 가져오는 중...
                    </div>
                ) : error ? (
                    <div style={{padding: 20, color: 'red', textAlign:'center'}}>{error}</div>
                ) : buses.length === 0 ? (
                    <li style={{padding: 20, textAlign: 'center', color: '#888'}}>도착 예정 버스 없음</li>
                ) : (
                    buses.map((bus, index) => (
                        <BusItem key={`${bus.rtNm}-${index}`}>
                            <div>
                                <BusNumber type={bus.routeType}>
                                    {bus.rtNm}
                                    {bus.busType1 === '1' && <span style={{fontSize:'0.7rem', color:'#999', fontWeight:'normal', marginLeft:5}}>저상</span>}
                                </BusNumber>
                                <div style={{fontSize: '0.8rem', color: '#868e96'}}>
                                    {bus.routeType === '3' ? '간선' : bus.routeType === '4' ? '지선' : '일반'}
                                </div>
                            </div>
                            <div>
                                <BusMsg>{bus.arrmsg1}</BusMsg>
                                <SubMsg>
                                    {bus.isLast1 === '1' && <span style={{color:'red', marginRight:5}}>⚠️막차</span>}
                                    {getCrowding(bus.reride_Num1)}
                                    {bus.arrmsg2 && ` (다음: ${bus.arrmsg2})`}
                                </SubMsg>
                            </div>
                        </BusItem>
                    ))
                )}
            </BusList>
        </Container>
    );
};

export default ArrivalInfo;