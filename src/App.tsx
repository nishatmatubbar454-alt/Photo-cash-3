/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { SettingsProvider } from './contexts/SettingsContext';
import { AuthProvider } from './contexts/AuthContext';
import { AppShell } from './components/AppShell';

export default function App() {
  return (
    <SettingsProvider>
      <AuthProvider>
        <AppShell />
      </AuthProvider>
    </SettingsProvider>
  );
}
