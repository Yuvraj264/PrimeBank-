import { Provider } from 'react-redux';
import { store } from '@/store';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from './pages/Login';
import Register from './pages/Register';
import BiometricLogin from './pages/BiometricLogin';
import CustomerDashboard from './pages/customer/CustomerDashboard';
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import AdminDashboard from './pages/admin/AdminDashboard';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Transfers from './pages/customer/Transfers';
import BillPayments from './pages/customer/BillPayments';
import Transactions from './pages/customer/Transactions';
import Beneficiaries from './pages/customer/Beneficiaries';
import Statements from './pages/customer/Statements';
import Security from './pages/customer/Security';
import ProfileSetup from './pages/customer/ProfileSetup';
import CustomerProfile from './pages/customer/CustomerProfile';
import CardsAndAccounts from './pages/customer/CardsAndAccounts';
import KYCSubmission from './pages/customer/KYCSubmission';
import Loans from './pages/customer/Loans';
import Investments from './pages/customer/Investments';
import Customers from './pages/employee/Customers';
import CustomerDetails from './pages/employee/CustomerDetails';
import KYCVerification from './pages/employee/KYCVerification';
import EmployeeTransactions from './pages/employee/EmployeeTransactions';
import LoanApprovals from './pages/employee/LoanApprovals';
import ActivityLog from './pages/employee/ActivityLog';
import NotFound from "./pages/NotFound";
import UserManagement from './pages/admin/UserManagement';
import EmployeeManagement from './pages/admin/EmployeeManagement';
import AccountManagement from './pages/admin/AccountManagement';
import FraudMonitor from './pages/admin/FraudMonitor';
import AuditLogs from './pages/admin/AuditLogs';
import SystemConfig from './pages/admin/SystemConfig';

const queryClient = new QueryClient();

const App = () => (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/biometric-login" element={<BiometricLogin />} />

            {/* Customer Routes */}
            <Route path="/customer" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerDashboard />
              </ProtectedRoute>
            } />
            <Route path="/customer/transfers" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Transfers />
              </ProtectedRoute>
            } />
            <Route path="/customer/bills" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <BillPayments />
              </ProtectedRoute>
            } />
            <Route path="/customer/transactions" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Transactions />
              </ProtectedRoute>
            } />
            <Route path="/customer/beneficiaries" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Beneficiaries />
              </ProtectedRoute>
            } />
            <Route path="/customer/statements" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Statements />
              </ProtectedRoute>
            } />
            <Route path="/customer/security" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Security />
              </ProtectedRoute>
            } />
            <Route path="/customer/onboarding" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ProfileSetup />
              </ProtectedRoute>
            } />
            <Route path="/customer/kyc-submission" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <KYCSubmission />
              </ProtectedRoute>
            } />
            <Route path="/customer/profile" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CustomerProfile />
              </ProtectedRoute>
            } />
            <Route path="/customer/cards" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CardsAndAccounts />
              </ProtectedRoute>
            } />
            <Route path="/customer/loans" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Loans />
              </ProtectedRoute>
            } />
            <Route path="/customer/investments" element={
              <ProtectedRoute allowedRoles={['customer']}>
                <Investments />
              </ProtectedRoute>
            } />

            {/* Employee Routes */}
            <Route path="/employee" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeDashboard />
              </ProtectedRoute>
            } />
            <Route path="/employee/customers" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <Customers />
              </ProtectedRoute>
            } />
            <Route path="/employee/customers/:id" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <CustomerDetails />
              </ProtectedRoute>
            } />
            <Route path="/employee/kyc" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <KYCVerification />
              </ProtectedRoute>
            } />
            <Route path="/employee/transactions" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <EmployeeTransactions />
              </ProtectedRoute>
            } />
            <Route path="/employee/loans" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <LoanApprovals />
              </ProtectedRoute>
            } />
            <Route path="/employee/activity" element={
              <ProtectedRoute allowedRoles={['employee']}>
                <ActivityLog />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            } />
            <Route path="/admin/users" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <UserManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/employees" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <EmployeeManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/accounts" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AccountManagement />
              </ProtectedRoute>
            } />
            <Route path="/admin/fraud" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <FraudMonitor />
              </ProtectedRoute>
            } />
            <Route path="/admin/audit" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AuditLogs />
              </ProtectedRoute>
            } />
            <Route path="/admin/config" element={
              <ProtectedRoute allowedRoles={['admin']}>
                <SystemConfig />
              </ProtectedRoute>
            } />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </Provider>
);

export default App;
