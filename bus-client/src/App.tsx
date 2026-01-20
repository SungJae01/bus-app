import { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

interface Station {
  id?: number;
  stationId: string; // API용 내부 ID (stId)
  stationName: string; // 정류장 이름 (stNm)
  arsId: string;     // 정류장 번호 (arsId, 5자리)
}

function App() {
  const [stations, setStations] = useState<Station[]>([]);
  const [arrivalInfo, setArrivalInfo] = useState<any>(null);

  // ✨ 검색 관련 상태
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);

  // ✨ 로딩 상태
  const [isLoading, setIsLoading] = useState(false);

  // ✨ 내 목록 검색어 상태
  const [myKeyword, setMyKeyword] = useState('');

  useEffect(() => {
    getStations();
  }, []);

  // ✨ NEW: 내 DB 검색 함수
  const handleLocalSearch = async (e?: React.FormEvent) => {
    if(e) e.preventDefault(); // 엔터키 눌렀을 때 새로고침 방지
    
    if (!myKeyword) {
        alert("검색어를 입력하세요!");
        return;
    }

    try {
      // 내 서버의 로컬 검색 API 호출
      const response = await axios.get<Station[]>(`http://localhost:8080/api/stations/local-search?keyword=${myKeyword}`);
      setStations(response.data);
      if(response.data.length === 0) {
          alert("저장된 정류장 중 검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("검색 실패:", error);
    }
  };

  // 내 DB에서 저장된 목록 가져오기
  const getStations = async () => {
    try {
      const response = await axios.get<Station[]>('http://localhost:8080/api/stations');
      setStations(response.data);
    } catch (error) {
      console.error("데이터 로드 실패:", error);
    }
  };

  // ✨ NEW: 전체 동기화 함수
  const handleSync = async () => {
    if (!window.confirm("서울시 모든 정류장(약 1만개)을 저장합니다.\n1~2분 정도 소요됩니다. 진행할까요?")) return;

    setIsLoading(true); // 로딩 시작
    try {
      const response = await axios.post('http://localhost:8080/api/stations/sync');
      alert(response.data); // "총 12000개 저장되었습니다!" 메시지 출력
      getStations(); // 목록 새로고침
    } catch (error) {
      console.error("동기화 실패:", error);
      alert("동기화 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false); // 로딩 끝
    }
  };

  // 서울시 API에서 정류장 이름으로 검색
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKeyword) return;

    try {
      // 백엔드에 검색 요청
      const response = await axios.get(`http://localhost:8080/api/stations/search?keyword=${searchKeyword}`);
      console.log("검색 결과:", response.data);

      const items = response.data?.msgBody?.itemList;
      // 검색 결과가 1개일 때와 여러 개일 때 처리
      if (items) {
        setSearchResults(Array.isArray(items) ? items : [items]);
      } else {
        setSearchResults([]);
        alert("검색 결과가 없습니다.");
      }
    } catch (error) {
      console.error("검색 실패:", error);
      alert("검색 중 오류가 발생했습니다.");
    }
  };

  // 3. ✨ [저장] 검색된 정류장을 내 DB에 저장
  const handleSave = async (station: any) => {
    // 이미 저장된 정류장인지 확인 (arsId 기준)
    const isExist = stations.some(s => s.arsId === station.arsId);
    if (isExist) {
      alert("이미 저장된 정류장입니다!");
      return;
    }

    const newStation: Station = {
      stationName: station.stNm,
      stationId: station.stId, // 서울시 API 필드명: stId
      arsId: station.arsId     // 서울시 API 필드명: arsId
    };

    try {
      await axios.post('http://localhost:8080/api/stations', newStation);
      alert(`${newStation.stationName} 저장 완료!`);
      getStations(); // 저장된 목록 갱신
      setSearchResults([]); // 검색 결과 초기화 (선택사항)
      setSearchKeyword(''); // 검색어 초기화
    } catch (error) {
      console.error("저장 실패:", error);
      alert("저장에 실패했습니다.");
    }
  };

  // 4. [조회] 버스 도착 정보 확인
  const handleCheckArrival = async (arsId: string) => {
    try {
      setArrivalInfo(null);
      const response = await axios.get(`http://localhost:8080/api/stations/arrival/${arsId}`);
      const items = response.data?.msgBody?.itemList;
      setArrivalInfo(items);
    } catch (error) {
      console.error("도착 조회 실패:", error);
    }
  };

  // 5. [삭제] 기능 (보너스)
  const handleDelete = async (id: number) => {
    if(!window.confirm("삭제하시겠습니까?")) return;
    try {
      // *참고: 백엔드에 @DeleteMapping 추가 필요 (없으면 에러 날 수 있음)
      // 현재는 UI에서만 안 보이게 처리하거나, 백엔드 추가 필요
      alert("삭제 기능은 백엔드 Controller에 @DeleteMapping을 추가해야 동작합니다."); 
    } catch(e) {}
  };

return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚏 나만의 서울 버스 (Full Ver.)</h1>
      <div style={{ display: 'flex', gap: '20px', flexDirection: 'row' }}>
        
        {/* 왼쪽: 내 정류장 검색 및 목록 */}
        <div style={{ flex: 1 }}>
          <h3>⭐ 내 정류장 찾기</h3>
          
          {/* ✨ 내 DB 검색창 */}
          <form onSubmit={handleLocalSearch} style={{ display: 'flex', gap: '5px', marginBottom: '10px' }}>
            <input 
                placeholder="저장된 정류장 검색 (예: 강남)"
                value={myKeyword}
                onChange={(e) => setMyKeyword(e.target.value)}
                style={{ flex: 1, padding: '8px' }}
            />
            <button type="submit" style={{ cursor: 'pointer', background: '#333', color: 'white', border: 'none', padding: '0 15px' }}>
                검색
            </button>
          </form>

          <div style={{ height: '500px', overflowY: 'auto', border: '1px solid #ddd', borderRadius: '5px' }}>
            {stations.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
                    검색어를 입력하여<br/>정류장을 찾아보세요.
                </div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {stations.map((station) => (
                    <li key={station.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                        <div style={{ fontWeight: 'bold' }}>{station.stationName}</div>
                        <div style={{ color: '#666', fontSize: '0.8em' }}>{station.arsId}</div>
                        </div>
                        <button 
                        onClick={() => handleCheckArrival(station.arsId)}
                        style={{ background: '#2196F3', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' }}
                        >
                        도착
                        </button>
                    </li>
                    ))}
                </ul>
            )}
          </div>
        </div>

        {/* 오른쪽: 실시간 도착 정보 (기존과 동일) */}
        <div style={{ flex: 1, background: '#e3f2fd', padding: '20px', borderRadius: '10px', height: 'fit-content' }}>
          <div style={{ display: 'flex', gap: '20px', flexDirection: 'column'}}>
            <h3>🚌 실시간 도착 정보</h3>
              {arrivalInfo ? (
                Array.isArray(arrivalInfo) ? (
                  <ul style={{ paddingLeft: '20px' }}>
                    {arrivalInfo.map((bus: any, index: number) => (
                      <li key={index} style={{ marginBottom: '8px' }}>
                        <strong style={{ color: '#0d47a1', fontSize: '1.1em' }}>{bus.rtNm}번</strong>
                        <br />
                        <span style={{ color: '#d32f2f' }}>{bus.arrmsg1}</span>
                        <span style={{ color: '#666', fontSize: '0.8em' }}> (다음: {bus.arrmsg2})</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div>
                    <strong style={{ color: '#0d47a1' }}>{arrivalInfo.rtNm}번</strong>
                    <br />
                    {arrivalInfo.arrmsg1}
                  </div>
                )
              ) : (
                <div style={{ color: '#666', textAlign: 'center', marginTop: '50px' }}>
                  왼쪽 목록에서<br/>[도착] 버튼을 눌러주세요.
                </div>
              )}
              {/* 전체 데이터 동기화 버튼 */}
              <button 
                onClick={handleSync}
                disabled={isLoading}
                style={{ 
                  background: isLoading ? '#ccc' : '#FF5722', 
                  color: 'white', border: 'none', padding: '10px 20px', 
                  borderRadius: '5px', cursor: isLoading ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold', fontSize: '0.9em'
                }}
              >
                {isLoading ? '1만개 데이터 저장 중... ⏳' : '🔄 서울시 전체 데이터 내려받기 (동기화)'}
              </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;