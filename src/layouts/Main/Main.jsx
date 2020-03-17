import React, {useState} from 'react';
import PropTypes from 'prop-types';
// import clsx from 'clsx';
import {makeStyles, useTheme} from '@material-ui/styles';
import {useMediaQuery} from '@material-ui/core';

import {Topbar, Sidebar} from './components';

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
    content: {
        flexGrow: 1,
        height: '100vh',
        overflow: 'auto',
    },
    fakeToolbar: {
        ...theme.mixins.toolbar,
    },
}));

const Main = props => {
    const {children, disableForm} = props;
    const classes = useStyles();
    const theme = useTheme();
    const isDesktop = useMediaQuery(theme.breakpoints.up('lg'), {
        defaultMatches: true,
    });

    const [openSidebar, setOpenSidebar] = useState(false);
    const [userToggledSidebar, setUserToggledSidebar] = useState(false);

    const handleSidebarOpen = () => {
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
            <Topbar
                isSidebarOpen={shouldOpenSidebar}
                onSidebarOpen={handleSidebarOpen}
                onSidebarClose={handleSidebarClose}
            />
            <Sidebar
                onClose={handleSidebarClose}
                open={shouldOpenSidebar}
                variant={isDesktop ? 'persistent' : 'temporary'}
                disableForm={disableForm}
            />
            <main className={classes.content}>
                <div className={classes.fakeToolbar} />
                {children}
            </main>
        </div>
    );
};

Main.propTypes = {
    children: PropTypes.node,
    disableForm: PropTypes.bool,
};

export default Main;
