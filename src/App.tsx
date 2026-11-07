/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { VideoListView } from './components/VideoListView';
import { ABTestingView } from './components/ABTestingView';
import { SecurityView } from './components/SecurityView';
import { ConversionsView } from './components/ConversionsView';
import { HostingView } from './components/HostingView';
import { SettingsView } from './components/SettingsView';
import { AcademyView } from './components/AcademyView';
import { HelpView } from './components/HelpView';
import { EmbedCodeModal } from './components/EmbedCodeModal';
import { SalesPageSimulatorModal } from './components/SalesPageSimulatorModal';
import { VideoEditModal } from './components/VideoEditModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { UploadVideoModal } from './components/UploadVideoModal';
import { ThumbSniperModal } from './components/ThumbSniperModal';
import { INITIAL_VIDEOS, INITIAL_FOLDERS, INITIAL_AB_TESTS } from './data/mockVideos';
import { VideoItem, Folder, ABTest, ActiveTab } from './types';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>(INITIAL_VIDEOS);
  const [folders, setFolders] = useState<Folder[]>(INITIAL_FOLDERS);
  const [abTests, setAbTests] = useState<ABTest[]>(INITIAL_AB_TESTS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('videos');
  const [activeFolderId, setActiveFolderId] = useState<string>('all');

  // Modals state
  const [selectedEmbedVideo, setSelectedEmbedVideo] = useState<VideoItem | null>(null);
  const [selectedSimulatorVideo, setSelectedSimulatorVideo] = useState<VideoItem | null>(null);
  const [selectedEditVideo, setSelectedEditVideo] = useState<VideoItem | null>(null);
  const [selectedAnalyticsVideo, setSelectedAnalyticsVideo] = useState<VideoItem | null>(null);
  const [selectedThumbSniperVideo, setSelectedThumbSniperVideo] = useState<VideoItem | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Computations
  const nonTrashVideos = videos.filter((v) => !v.isTrash);
  const totalPlays = nonTrashVideos.reduce((acc, v) => acc + v.plays, 0);
  const totalViews = nonTrashVideos.reduce((acc, v) => acc + v.views, 0);
  const overallPlayRate = totalViews > 0 ? Math.round((totalPlays / totalViews) * 100) : 64;

  // Handlers
  const handleUploadSuccess = (newVideo: VideoItem) => {
    setVideos([newVideo, ...videos]);
    // Automatically open the embed code modal so the user gets their code instantly!
    setSelectedEmbedVideo(newVideo);
  };

  const handleUpdateVideo = (updated: VideoItem) => {
    setVideos(videos.map((v) => (v.id === updated.id ? updated : v)));
  };

  const handleDeleteVideo = (id: string) => {
    setVideos(videos.map((v) => (v.id === id ? { ...v, isTrash: true } : v)));
  };

  const handleRestoreVideo = (id: string) => {
    setVideos(videos.map((v) => (v.id === id ? { ...v, isTrash: false } : v)));
  };

  const handleCreateFolder = (name: string) => {
    const newFolder: Folder = {
      id: `fld_${Math.random().toString(36).substring(2, 7)}`,
      name,
      color: '#64748b',
    };
    setFolders([...folders, newFolder]);
    setActiveFolderId(newFolder.id);
  };

  const handleCreateABTest = (newTest: ABTest) => {
    setAbTests([newTest, ...abTests]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Header
        totalPlays={totalPlays}
        playRate={overallPlayRate}
      />

      {/* Main Workspace: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row">
        
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          videoCount={nonTrashVideos.length}
        />

        {/* Content Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
          {activeTab === 'videos' && (
            <VideoListView
              videos={videos}
              folders={folders}
              activeFolderId={activeFolderId}
              onSelectFolder={setActiveFolderId}
              onCreateFolder={handleCreateFolder}
              onOpenUpload={() => setShowUploadModal(true)}
              onOpenEmbed={(video) => setSelectedEmbedVideo(video)}
              onOpenSimulator={(video) => setSelectedSimulatorVideo(video)}
              onOpenEdit={(video) => setSelectedEditVideo(video)}
              onOpenAnalytics={(video) => setSelectedAnalyticsVideo(video)}
              onOpenThumbSniper={(video) => setSelectedThumbSniperVideo(video)}
              onDeleteVideo={handleDeleteVideo}
              onRestoreVideo={handleRestoreVideo}
            />
          )}

          {activeTab === 'hosting' && (
            <HostingView onOpenUpload={() => setShowUploadModal(true)} />
          )}

          {activeTab === 'ab_tests' && (
            <ABTestingView
              videos={nonTrashVideos}
              abTests={abTests}
              onCreateTest={handleCreateABTest}
              onOpenEmbed={(video) => setSelectedEmbedVideo(video)}
            />
          )}

          {activeTab === 'security' && <SecurityView />}

          {activeTab === 'conversions' && <ConversionsView />}

          {activeTab === 'settings' && <SettingsView />}

          {activeTab === 'academy' && <AcademyView />}

          {activeTab === 'help' && <HelpView />}
        </main>

      </div>

      {/* MODAL 1: Embed Code & PV Snippet Generator */}
      {selectedEmbedVideo && (
        <EmbedCodeModal
          video={selectedEmbedVideo}
          isOpen={!!selectedEmbedVideo}
          onClose={() => setSelectedEmbedVideo(null)}
          onOpenSimulator={() => {
            const vid = selectedEmbedVideo;
            setSelectedEmbedVideo(null);
            setSelectedSimulatorVideo(vid);
          }}
        />
      )}

      {/* MODAL 2: Live Sales Page Simulator (PV Preview) */}
      {selectedSimulatorVideo && (
        <SalesPageSimulatorModal
          video={selectedSimulatorVideo}
          isOpen={!!selectedSimulatorVideo}
          onClose={() => setSelectedSimulatorVideo(null)}
          onOpenEmbedModal={() => {
            const vid = selectedSimulatorVideo;
            setSelectedSimulatorVideo(null);
            setSelectedEmbedVideo(vid);
          }}
        />
      )}

      {/* MODAL 3: Player Settings & Pitch Delay Editor */}
      {selectedEditVideo && (
        <VideoEditModal
          video={selectedEditVideo}
          folders={folders.filter((f) => f.id !== 'all')}
          isOpen={!!selectedEditVideo}
          onClose={() => setSelectedEditVideo(null)}
          onSave={handleUpdateVideo}
          onOpenEmbed={(video) => {
            setSelectedEditVideo(null);
            setSelectedEmbedVideo(video);
          }}
        />
      )}

      {/* MODAL 4: Retention Analytics & Graph */}
      {selectedAnalyticsVideo && (
        <AnalyticsModal
          video={selectedAnalyticsVideo}
          isOpen={!!selectedAnalyticsVideo}
          onClose={() => setSelectedAnalyticsVideo(null)}
          onOpenEmbed={() => {
            const vid = selectedAnalyticsVideo;
            setSelectedAnalyticsVideo(null);
            setSelectedEmbedVideo(vid);
          }}
        />
      )}

      {/* MODAL 5: Upload New Video */}
      {showUploadModal && (
        <UploadVideoModal
          folders={folders.filter((f) => f.id !== 'all')}
          isOpen={showUploadModal}
          onClose={() => setShowUploadModal(false)}
          onUploadSuccess={handleUploadSuccess}
        />
      )}

      {/* MODAL 6: ThumbSniper Configurator */}
      {selectedThumbSniperVideo && (
        <ThumbSniperModal
          isOpen={!!selectedThumbSniperVideo}
          settings={selectedThumbSniperVideo.settings.thumbSniper}
          onClose={() => setSelectedThumbSniperVideo(null)}
          onSave={(newSniperSettings) => {
            handleUpdateVideo({
              ...selectedThumbSniperVideo,
              settings: {
                ...selectedThumbSniperVideo.settings,
                thumbSniper: newSniperSettings,
              },
            });
            setSelectedThumbSniperVideo(null);
          }}
        />
      )}

    </div>
  );
}
