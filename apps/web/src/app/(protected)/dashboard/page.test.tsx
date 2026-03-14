import React from 'react';
import { render, screen } from '@testing-library/react';
import DashboardPage from './page';
import { UserRole } from '@featureboard/shared';

// Mock auth context
let mockUser: any = null;
jest.mock('@/lib/auth-context', () => ({
  useAuth: () => ({ user: mockUser }),
}));

describe('DashboardPage', () => {
  beforeEach(() => {
    mockUser = { id: '1', name: 'Chef User', role: UserRole.CHEF };
  });

  it('should render dashboard heading', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
  });

  it('should render core navigation cards', () => {
    render(<DashboardPage />);
    expect(screen.getByText('Feature Library')).toBeInTheDocument();
    expect(screen.getByText('Weekly Schedule')).toBeInTheDocument();
    expect(screen.getByText('Wine Pairings')).toBeInTheDocument();
    expect(screen.getByText("Today's Lineup")).toBeInTheDocument();
  });

  it('should not show admin cards for non-admin users', () => {
    mockUser = { id: '1', name: 'Chef', role: UserRole.CHEF };
    render(<DashboardPage />);
    expect(screen.queryByText('Manage Users')).not.toBeInTheDocument();
    expect(screen.queryByText('Manage Categories')).not.toBeInTheDocument();
  });

  it('should show admin cards for admin users', () => {
    mockUser = { id: '1', name: 'Admin', role: UserRole.ADMIN };
    render(<DashboardPage />);
    expect(screen.getByText('Manage Users')).toBeInTheDocument();
    expect(screen.getByText('Manage Categories')).toBeInTheDocument();
  });

  it('should link cards to correct routes', () => {
    render(<DashboardPage />);
    const featureLink = screen.getByText('Feature Library').closest('a');
    expect(featureLink).toHaveAttribute('href', '/features');
    const scheduleLink = screen.getByText('Weekly Schedule').closest('a');
    expect(scheduleLink).toHaveAttribute('href', '/schedule');
  });
});
