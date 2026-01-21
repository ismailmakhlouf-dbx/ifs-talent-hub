import { useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import RecruitmentDashboard from './pages/RecruitmentDashboard'
import PerformanceDashboard from './pages/PerformanceDashboard'
import CandidateDetail from './pages/CandidateDetail'
import EmployeeDetail from './pages/EmployeeDetail'
import Referrals from './pages/Referrals'
import HRDashboard from './pages/HRDashboard'
import UnderTheHood from './pages/UnderTheHood'
import { PageContextProvider } from './contexts/PageContext'
import { AskThomFloatingButton } from './components/AskThom'

function App() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [selectedManager, setSelectedManager] = useState<string>('EMP-1000')

  return (
    <PageContextProvider>
      <BrowserRouter>
        <div className="flex h-screen bg-slate-50">
          {/* Sidebar */}
          <Sidebar 
            collapsed={sidebarCollapsed}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            selectedManager={selectedManager}
            onManagerChange={setSelectedManager}
          />
          
          {/* Main Content */}
          <main className={`flex-1 overflow-auto transition-all duration-300 ${sidebarCollapsed ? 'ml-20' : 'ml-80'}`}>
            <Routes>
              <Route path="/" element={<Navigate to="/recruitment" replace />} />
              <Route path="/recruitment" element={<RecruitmentDashboard managerId={selectedManager} />} />
              <Route path="/recruitment/candidate/:candidateId" element={<CandidateDetail />} />
              <Route path="/referrals" element={<Referrals />} />
              <Route path="/performance" element={<PerformanceDashboard managerId={selectedManager} />} />
              <Route path="/performance/employee/:employeeId" element={<EmployeeDetail />} />
              <Route path="/hr-dashboard" element={<HRDashboard />} />
              <Route path="/under-the-hood" element={<UnderTheHood />} />
            </Routes>
          </main>
          
          {/* Floating AskThom Button - Always visible on all pages */}
          <AskThomFloatingButton />
        </div>
      </BrowserRouter>
    </PageContextProvider>
  )
}

export default App
