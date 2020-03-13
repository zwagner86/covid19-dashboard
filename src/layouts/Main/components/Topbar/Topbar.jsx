import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {AppBar, Toolbar, Hidden, IconButton} from '@material-ui/core';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import SettingsIcon from '@material-ui/icons/Settings';

const useStyles = makeStyles(theme => ({
    root: {
        boxShadow: 'none',
    },
    title: {
        flexGrow: 1,
        textAlign: 'center',
        [theme.breakpoints.down('md')]: {
            textAlign: 'right',
            paddingRight: 14,
        },
    },
    logoLink: {
        marginLeft: theme.spacing(1),
    },
    logo: {
        height: '30px',
        marginTop: '5px',
    },
    emptyDiv: {
        width: 48,
    },
}));

const Topbar = props => {
    const {
        className,
        isSidebarOpen,
        onSidebarOpen,
        onSidebarClose,
        ...rest
    } = props;
    const classes = useStyles();

    return (
        <AppBar {...rest} className={clsx(classes.root, className)}>
            <Toolbar>
                {isSidebarOpen ? (
                    <IconButton color="inherit" onClick={onSidebarClose}>
                        <ArrowBackIcon />
                    </IconButton>
                ) : (
                    <IconButton color="inherit" onClick={onSidebarOpen}>
                        <SettingsIcon />
                    </IconButton>
                )}
                <div className={classes.title}>COVID-19 Model</div>
                <Hidden mdDown>
                    <div className={classes.emptyDiv} />
                </Hidden>
            </Toolbar>
        </AppBar>
    );
};

Topbar.propTypes = {
    className: PropTypes.string,
    isSidebarOpen: PropTypes.bool,
    onSidebarOpen: PropTypes.func,
    onSidebarClose: PropTypes.func,
};

export default Topbar;
