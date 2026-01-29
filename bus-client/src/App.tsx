import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAxios } from './hooks/useAxios'; // 자동 조회 훅
import { useApi } from './hooks/useApi';     // 수동 요청 훅
import './App.css';
import Header from './components/header';
import SearchStation from './components/searchStation';
import SearchResultSheet from './components/SearchResultSheet';
import HeaderMenu from './components/headerMenu';
import HomeView from './components/HomeView';
import SearchView from './components/SearchVeiw';
import FavoriteView from './components/FavoriteView';
import SettingsView from './components/SettingsView';

// 정류장 인터페이스 정의
interface Station {
  id?: number;
  stationId: string;
  stationName: string;
  arsId: string;
  adirection?: string;
}

function App() {
  // ✅ 1. 내 정류장 목록 (자동 조회)
  // useAxios 덕분에 useEffect가 필요 없음
  const { 
    data: stations, 
    loading: isListLoading, 
    error: listError, 
    refetch: refreshStations // 목록 새로고침 함수
  } = useAxios<Station[]>('http://localhost:8080/api/stations');

  useEffect(() => {
    if (stations) {
      console.log("📂 [DB Load] 내 정류장 전체 목록:", stations);
      console.log("🔢 총 정류장 개수:", stations.length);
    }
  }, [stations]); // stations 값이 바뀔 때마다 실행됨

  // ✅ 2. 수동 요청 처리기 (검색, 저장, 삭제 등)
  const { request, loading: isActionLoading } = useApi();

  // 상태 관리
  const [arrivalInfo, setArrivalInfo] = useState<any>(null);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [myKeyword, setMyKeyword] = useState('');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  // 현재 보고 있는 화면의 상태 (기본값: home)
  const [currentView, setCurrentView] = useState('home');

  // 예시 컴포넌트들
  //const HomeView = () => <div>🏠 홈 화면입니다.</div>;
  //const SearchView = () => <div>🔍 검색 화면입니다.</div>;
  //const FavoriteView = () => <div>⭐ 즐겨찾기 화면입니다.</div>;
  //const SettingsView = () => <div>⚙️ 설정 화면입니다.</div>;

  const renderContent = () => {
        switch (currentView) {
            case 'home': return <HomeView />;
            case 'search': return <SearchView />;
            case 'favorite': return <FavoriteView />;
            case 'settings': return <SettingsView />;
            default: return <HomeView />;
        }
    };

  // 3. 공공데이터 검색 (수동)
  const handleSearch = async (input?: React.FormEvent | string) => {
    
    // (1) 만약 form 이벤트가 들어왔다면 새로고침 방지
    if (input && typeof input !== 'string') {
        input.preventDefault();
    }

    // (2) 검색어 결정 로직
    // - input이 문자열이면(아이콘 클릭 시) -> 그 문자열 사용
    // - input이 이벤트면(엔터 키) -> 기존 state(searchKeyword) 사용
    const targetKeyword = typeof input === 'string' ? input : searchKeyword;

    if (!targetKeyword) return;

    // (3) API 요청 (searchKeyword 대신 targetKeyword 사용!)
    const { success, data } = await request<any>(() => 
      axios.get(`http://localhost:8080/api/stations/search?keyword=${targetKeyword}`)
    );

    console.log("🔥 [공공데이터 API 응답]:", data);

    if (success && data) {
      // 데이터 구조 파싱 (msgBody, ServiceResult 등 대응)
      const msgBody = data.msgBody || data.ServiceResult?.msgBody || data.response?.msgBody;
      const items = msgBody?.itemList;

      // 배열로 변환
      const finalItems = items ? (Array.isArray(items) ? items : [items]) : [];
      
      setSearchResults(finalItems);
      
      if (finalItems.length > 0) {
          // ✨ [핵심] 결과가 있으면 바텀 시트를 엽니다!
          setIsSheetOpen(true);
      } else {
          alert("검색 결과가 없습니다.");
      }
    }
  };

  // ✨ [수정] 정류장 선택 시: "도착 정보"를 조회해 방면을 채운 뒤 저장
  const handleSelectStation = async (station: any) => {
      
      // 사용자에게 의사 묻기 (선택사항)
      // if (!window.confirm(`'${station.stNm}'을(를) 추가하시겠습니까?`)) return;

      let direction = ""; // 기본값은 빈 문자열

      // 1. 방면 정보를 얻기 위해 도착 API를 먼저 살짝 호출해봅니다.
      try {
          console.log(`🔍 [${station.stNm}] 방면 정보 조회 중...`);
          // 기존에 만들어둔 도착 정보 API 활용
          const res = await axios.get(`http://localhost:8080/api/stations/arrival?arsId=${station.arsId}`);
          
          // 데이터 파싱
          const data = res.data;
          const msgBody = data.msgBody || data.ServiceResult?.msgBody || data.response?.msgBody;
          const items = msgBody?.itemList;
          
          if (items) {
              // 결과가 배열이면 첫 번째, 객체면 바로 사용
              const firstItem = Array.isArray(items) ? items[0] : items;
              // adirection(방면) 값을 가져옴
              if (firstItem && firstItem.adirection) {
                  direction = firstItem.adirection;
                  console.log("✅ 방면 정보 발견:", direction);
              }
          }
      } catch (error) {
          console.warn("방면 정보 조회 실패 (무시하고 진행):", error);
      }

      // 2. 완성된 데이터로 저장 요청 (payload 생성)
      const payload = {
          stationName: station.stNm,
          stationId: station.stId,
          arsId: station.arsId,
          adirection: direction, // ✨ 여기서 조회한 방면 정보를 넣습니다!
      };

      console.log("📤 최종 저장 데이터:", payload);

      // 3. 백엔드로 POST 요청 (기존 코드와 동일)
      const { success, data: responseMsg } = await request<any>(() => 
          axios.post('http://localhost:8080/api/stations', payload)
      );

      if (success) {
          alert(`'${station.stNm}' (${direction ? direction + ' 방면' : '방면 정보 없음'}) 저장 완료! 🎉`);
          setIsSheetOpen(false); 
          refreshStations(); 
      }
  };

  // 4. 내 목록 검색 (수동)
  const filteredStations = stations?.filter((station) => 
    station.stationName.includes(myKeyword) || 
    station.arsId.includes(myKeyword)
  );

  // 5. 저장하기 (수동)
  const handleSave = async (station: any) => {
    // 중복 체크 (stations 데이터가 로드된 상태여야 함)
    if (stations && stations.some(s => s.arsId === station.arsId)) {
      alert("이미 저장된 정류장입니다.");
      return;
    }

    const newStation = {
      stationName: station.stNm,
      stationId: station.stId,
      arsId: station.arsId
    };

    const { success } = await request(() => 
      axios.post('http://localhost:8080/api/stations', newStation)
    );

    if (success) {
      alert("저장 완료!");
      refreshStations(); // ✨ 목록 새로고침 (useAxios의 refetch)
      setSearchResults([]);
      setSearchKeyword('');
    }
  };

  // 6. 도착 정보 확인 (수동)
  const handleCheckArrival = async (arsId: string) => {
    setArrivalInfo(null);

    const { success, data } = await request<any>(() => 
      axios.get(`http://localhost:8080/api/stations/arrival/${arsId}`)
    );

    console.log("🔥 [전체 응답 데이터]:", data);
    console.log("📂 [msgBody 내용]:", data?.msgBody);
    console.log("🚌 [itemList (실제 버스 목록)]:", data?.msgBody?.itemList);

    if (success && data) {
      // 공공데이터 에러 코드 확인
      if (data.msgHeader?.headerCd !== "0") {
        alert("API 오류: " + data.msgHeader?.headerMsg);
        return;
      }
      setArrivalInfo(data.msgBody?.itemList);
    }
  };

  // 7. 삭제하기 (수동)
  const handleDelete = async (id: number) => {
    if (!window.confirm("삭제하시겠습니까?")) return;
    
    const { success } = await request(() => 
      axios.delete(`http://localhost:8080/api/stations/${id}`)
    );

    if (success) {
      alert("삭제되었습니다.");
      refreshStations(); // ✨ 목록 새로고침
    }
  };

  return (
    <div style={{ maxWidth: '800px', maxHeight: '1169px', margin: '0 auto' }}>
      <Header />
      <HeaderMenu onMenuSelect={setCurrentView}/>
      <main style={{ padding: '20px' }}>
                <h2>메인 컨텐츠 영역</h2>
                {renderContent()}
            </main>
      <SearchResultSheet 
            isOpen={isSheetOpen}
            onClose={() => setIsSheetOpen(false)}
            results={searchResults}
            onSelect={handleSelectStation}
        />
      <SearchStation
        value={searchKeyword}           // 상태 전달
        onChange={setSearchKeyword}     // 변경 함수 전달
        onSearch={handleSearch} // 검색 함수 전달
      />
    </div>
  );
}

export default App;

// 로딩 표시
//         {(isListLoading || isActionLoading) && (
//           <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'5px', background:'#FF5722' }} />
//         )}
        
//         <div style={{ height: '700px', width: '340px', display: 'flex', gap: '20px', flexDirection: 'column' }}>
//           {/* 상단: 내 정류장 (useAxios 데이터 사용) */}
//           <div style={{ flex: 1 }}>          
//             {/* ✨ [2] 검색창 수정 (form 제거, input만 남김) */}
//             <div style={{ marginBottom: '10px' }}>
//               <input 
//                   placeholder="내 목록에서 즉시 검색..."
//                   value={myKeyword}
//                   onChange={(e) => setMyKeyword(e.target.value)}
//                   style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px', boxSizing: 'border-box' }}
//               />
//             </div>

//             <div style={{ height: '50%', overflowY: 'auto', border: '1px solid #ddd' }}>
//               {/* ✨ [3] stations 대신 filteredStations 사용 */}
//               {filteredStations && filteredStations.length > 0 ? (
//                   filteredStations.map(station => (
//                     <div key={station.id} style={{ padding: '15px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between' }}>
//                       {/* 정류장 이름 */}
//                       <div style={{ fontWeight: 'bold' }}>{station.stationName}</div>
                      
//                       {/* ARS 번호 및 방면 */}
//                       <div style={{ fontSize: '0.8rem', color: '#666' }}>
//                           {station.arsId}
//                           {/* ✨ [추가] 방면 정보가 있으면 표시 */}
//                           {station.adirection && ` | ${station.adirection} 방면`}
//                       </div>
//                       <div>
//                         <button onClick={() => handleCheckArrival(station.arsId)} style={{ marginRight:'5px', background:'#2196F3', color:'white', border:'none', padding:'5px', borderRadius:'3px', cursor: 'pointer' }}>도착</button>
//                         <button onClick={() => station.id && handleDelete(station.id)} style={{ background:'#ff5252', color:'white', border:'none', padding:'5px', borderRadius:'3px', cursor: 'pointer' }}>삭제</button>
//                       </div>
//                     </div>
//                   ))
//               ) : (
//                   <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>
//                       {stations && stations.length > 0 ? "검색 결과가 없습니다." : "저장된 정류장이 없습니다."}
//                   </div>
//               )}
//             </div>
//           </div>

//           {/* 하단: 도착 정보 */}
//           <div style={{ flex: 1, background: '#e3f2fd', padding: '20px', borderRadius: '10px' }}>
//             <h3>🚌 실시간 도착</h3>
//             {arrivalInfo ? (
//               Array.isArray(arrivalInfo) ? (
//                 <ul style={{ paddingLeft: '20px' }}>
//                   {arrivalInfo.map((bus: any, index: number) => (
//                     <li key={index} style={{ marginBottom: '10px' }}>
//                       <strong style={{ fontSize:'1.1em', color:'#0d47a1' }}>{bus.rtNm}번</strong><br/>
//                       <span style={{ color:'#d32f2f' }}>{bus.arrmsg1}</span>
//                     </li>
//                   ))}
//                 </ul>
//               ) : (
//                 <div><strong>{arrivalInfo.rtNm}번</strong>: {arrivalInfo.arrmsg1}</div>
//               )
//             ) : (
//               <div style={{ textAlign:'center', color:'#666', marginTop:'50px' }}>
//                 [도착] 버튼을 눌러주세요.
//               </div>
//             )}
//           </div>
//         </div>