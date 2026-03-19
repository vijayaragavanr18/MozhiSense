// App Router Configuration
// This file can be used to set up React Router in production
// Currently, the app shows all pages in gallery mode for preview

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage'
import ChallengePage from '../pages/ChallengePage'
import SemanticGraphPage from '../pages/SemanticGraphPage'
import ResultsPage from '../pages/ResultsPage'

export const AppRoutes = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/play" element={<ChallengePage />} />
      <Route path="/explore" element={<SemanticGraphPage />} />
      <Route path="/results" element={<ResultsPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  </BrowserRouter>
)

export default AppRoutes
