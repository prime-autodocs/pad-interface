import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home';
import { CustomerReports } from './pages/CustomerReports';
import { NewCustomer } from './pages/NewCustomer';
import { NewVehicle } from './pages/Vehicles/NewVehicle';

export default function AppRouter() {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<Login />} />
                <Route path="/home" element={<Home />} />
                <Route path="/new-customer" element={<NewCustomer />} /> 
                <Route path="/new-vehicle" element={<NewVehicle />} />
                <Route path="/customer-reports" element={<CustomerReports />} />

            </Routes>
        </Router>
    );
}

