import { useState } from 'react';
import './App.css';
import Header from './components/header';
import HeaderMenu from './components/headerMenu';
import HomeView from './components/HomeView';
import SearchView from './components/SearchVeiw';
import FavoriteView from './components/FavoriteView';
import SettingsView from './components/SettingsView';
import { NavermapsProvider } from 'react-naver-maps';

function App() {

  // 상태 관리
  // 현재 보고 있는 화면의 상태 (기본값: home)
  const [currentView, setCurrentView] = useState('home');

  const renderContent = () => {
        switch (currentView) {
            case 'home': return <HomeView />;
            case 'search': return <SearchView onStationSaved={() => setCurrentView('favorite')} />;
            case 'favorite': return <FavoriteView />;
            case 'settings': return <SettingsView />;
            default: return <HomeView />;
        }
    };

  return (
      <div style={{ maxWidth: '800px', maxHeight: '1169px', margin: '0 auto' }}>
        <Header />
        <HeaderMenu onMenuSelect={setCurrentView}/>
        <NavermapsProvider ncpKeyId="ghsdes6i7z">
          <main style={{ padding: '20px' }}>
                    {renderContent()}
                </main>
        </NavermapsProvider>
      </div>
  );
}

export default App;