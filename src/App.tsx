import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Weighing from "@/pages/Weighing";
import Storage from "@/pages/Storage";
import Dewatering from "@/pages/Dewatering";
import ThermalDrying from "@/pages/ThermalDrying";
import LowTempDrying from "@/pages/LowTempDrying";
import Transport from "@/pages/Transport";
import Ledger from "@/pages/Ledger";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="weighing" element={<Weighing />} />
          <Route path="storage" element={<Storage />} />
          <Route path="dewatering" element={<Dewatering />} />
          <Route path="thermal-drying" element={<ThermalDrying />} />
          <Route path="low-temp-drying" element={<LowTempDrying />} />
          <Route path="transport" element={<Transport />} />
          <Route path="ledger" element={<Ledger />} />
        </Route>
      </Routes>
    </Router>
  );
}
