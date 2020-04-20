import React, {useState} from 'react';
import PropTypes from 'prop-types';
import CssBaseline from '@material-ui/core/CssBaseline';
import {ThemeProvider} from '@material-ui/styles';
import theme from './theme';
// import regions from './data/regions';
import 'react-perfect-scrollbar/dist/css/styles.css';
import './App.scss';

import {SettingsProvider} from './SettingsContext';
import {Main as MainLayout} from './layouts';
import Dashboard from './views/Dashboard/Dashboard';

const App = ({initialSettings, loadingError, disableForm, hideForm}) => {
    const [settings, setSettings] = useState(initialSettings);

    return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            {loadingError ? (
                <div>error</div>
            ) : (
                <SettingsProvider value={{settings, setSettings}}>
                    <MainLayout disableForm={disableForm} hideForm={hideForm}>
                        <Dashboard />
                    </MainLayout>
                </SettingsProvider>
            )}
        </ThemeProvider>
    );
};

App.propTypes = {
    initialSettings: PropTypes.object,
    loadingError: PropTypes.bool,
    disableForm: PropTypes.bool,
    hideForm: PropTypes.bool,
};

export default App;
