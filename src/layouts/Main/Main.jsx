import React, {useState} from 'react';
import PropTypes from 'prop-types';
// import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/styles';
import {Fab, useMediaQuery} from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';

import {Sidebar} from './components';

/* const useStyles = makeStyles(theme => ({
    root: {
        paddingTop: 56,
        height: '100%',
        [theme.breakpoints.up('sm')]: {
            paddingTop: 64,
        },
    },
    shiftContent: {
        paddingLeft: 240,
        transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    content: {
        flexGrow: 1,
        height: '100%',
    },
})); */

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
    },
    fab: {
        position: 'absolute',
        top: theme.spacing(1),
        left: theme.spacing(1),
        zIndex: 3000,
    },
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
}));

const Main = props => {
    const {children} = props;
    const classes = useStyles();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), {
        defaultMatches: true,
    });

    const [openSidebar, setOpenSidebar] = useState(false);
    const [userToggledSidebar, setUserToggledSidebar] = useState(false);

    const onSidebarOpen = () => {
        setOpenSidebar(true);
        setUserToggledSidebar(true);
    };

    const handleSidebarClose = () => {
        setOpenSidebar(false);
        setUserToggledSidebar(true);
    };

    const shouldOpenSidebar =
        !userToggledSidebar && isDesktop ? true : openSidebar;

    return (
        <div className={classes.root}>
            <Sidebar
                onClose={handleSidebarClose}
                open={shouldOpenSidebar}
                variant={isDesktop ? 'persistent' : 'temporary'}
            />
            <main className={classes.content}>
                {!shouldOpenSidebar && (
                    <Fab
                        className={classes.fab}
                        color="inherit"
                        size="small"
                        onClick={onSidebarOpen}
                    >
                        <SettingsIcon />
                    </Fab>
                )}
                {children}
            </main>
        </div>
    );
};

Main.propTypes = {
    children: PropTypes.node,
};

export default Main;
