import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import BusinessProfile from './pages/BusinessProfile';
import InvoiceEditor from './pages/InvoiceEditor';
import InvoiceDetails from './pages/InvoiceDetails';

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/profile" element={<BusinessProfile />} />
      <Route path="/invoice/new" element={<InvoiceEditor />} />
      <Route path="/invoice/edit/:id" element={<InvoiceEditor />} />
      <Route path="/invoice/:id" element={<InvoiceDetails />} />
    </Routes>
  );
};

export default App;
