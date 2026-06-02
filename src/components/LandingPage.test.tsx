import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import LandingPage from './LandingPage';

vi.mock('../contexts/SettingsContext', () => ({
  useSettings: () => ({
    settings: { schoolName: 'SM KONVEN ST. URSULA', logoUrl: null },
  }),
}));

describe('LandingPage', () => {
  const mockOnSelectRole = vi.fn();
  const mockOnRegister = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the landing page with school name', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    expect(screen.getByText('SM KONVEN ST. URSULA')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Kokurikulum Management System/i })).toBeInTheDocument();
  });

  it('calls onSelectRole with admin when Administrator button is clicked', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const adminButton = screen.getByRole('button', { name: /Administrator/i });
    fireEvent.click(adminButton);
    expect(mockOnSelectRole).toHaveBeenCalledWith('admin');
  });

  it('calls onSelectRole with teacher when Teacher button is clicked', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const teacherButton = screen.getByRole('button', { name: /^Teacher$/i });
    fireEvent.click(teacherButton);
    expect(mockOnSelectRole).toHaveBeenCalledWith('teacher');
  });

  it('allows keyboard activation of the Teacher button', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const teacherButton = screen.getByRole('button', { name: /^Teacher$/i });
    // Teacher card should be a native button (naturally focusable, no tabIndex needed)
    expect(teacherButton.tagName).toBe('BUTTON');
    fireEvent.click(teacherButton);
    expect(mockOnSelectRole).toHaveBeenCalledWith('teacher');
  });

  it('calls onRegister when footer Request Access link is clicked', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const requestAccessButtons = screen.getAllByRole('button', { name: /Request Access/i });
    const footerButton = requestAccessButtons[requestAccessButtons.length - 1];
    fireEvent.click(footerButton);
    expect(mockOnRegister).toHaveBeenCalledTimes(1);
  });

  it('does not render decorative blur orbs', () => {
    const { container } = render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const blurOrbs = container.querySelector('[class*="blur-["]');
    expect(blurOrbs).toBeNull();
  });

  it('does not use hover:-translate-y-1 on role cards', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const adminButton = screen.getByRole('button', { name: /Administrator/i });
    expect(adminButton.className).not.toContain('hover:-translate-y-1');

    const teacherButton = screen.getByRole('button', { name: /^Teacher$/i });
    expect(teacherButton.className).not.toContain('hover:-translate-y-1');
  });

  it('uses a single navy color for the heading without a red accent span', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const heading = screen.getByRole('heading', { name: /Kokurikulum Management System/i });
    expect(heading.querySelector('span')).toBeNull();
  });

  it('does not render Request Access inside the Teacher card', () => {
    render(
      <LandingPage
        onSelectRole={mockOnSelectRole}
        onRegister={mockOnRegister}
      />
    );

    const teacherButton = screen.getByRole('button', { name: /^Teacher$/i });
    expect(teacherButton).not.toContainHTML('Request Access');
  });
});
