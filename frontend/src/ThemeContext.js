import React, { createContext, useMemo, useState } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';

export const CustomThemeContext = createContext({
  currentTheme: 'light',
  setTheme: () => {}
});

const CustomThemeProvider = ({ children }) => {
  const [themeName, setThemeName] = useState('light');
  const theme = useMemo(() => createTheme({
    palette: {
      mode: themeName
    }
  }), [themeName]);

  return (
    <CustomThemeContext.Provider value={{ currentTheme: themeName, setTheme: setThemeName }}>
      <ThemeProvider theme={theme}>
        {children}
      </ThemeProvider>
    </CustomThemeContext.Provider>
  );
};

export default CustomThemeProvider;
