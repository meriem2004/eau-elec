import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import { AuthProvider, useAuth } from '../../context/AuthContext.jsx';
import Login from '../Login.jsx';

vi.mock('../../services/api', () => ({
  default: {
    post: vi.fn().mockResolvedValue({
      data: {
        token: 'fake-jwt',
        user: {
          id_user: 1,
          nom: 'ADMIN',
          prenom: 'Super',
          email: 'admin@ree.ma',
          role: 'SUPERADMIN'
        }
      }
    })
  }
}));

function LoginWithProvider(props) {
  // Wrap Login with AuthProvider for tests
  return (
    <AuthProvider>
      <Login {...props} />
    </AuthProvider>
  );
}

test('renders login form and calls login on submit', async () => {
  const onLoginSuccess = vi.fn();

  render(<LoginWithProvider onLoginSuccess={onLoginSuccess} />);

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/mot de passe/i);
  const submitButton = screen.getByRole('button', { name: /se connecter/i });

  fireEvent.change(emailInput, { target: { value: 'admin@ree.ma' } });
  fireEvent.change(passwordInput, { target: { value: 'password123' } });
  fireEvent.click(submitButton);

  await waitFor(() => {
    expect(onLoginSuccess).toHaveBeenCalled();
  });
});


