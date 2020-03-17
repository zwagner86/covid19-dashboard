import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {colors, Divider, Drawer} from '@material-ui/core';

import {Info, SidebarSettings} from './components';

const useStyles = makeStyles(theme => ({
    drawer: {
        position: 'relative',
        width: 240,
        whiteSpace: 'nowrap',
    },
    drawerPaper: {
        backgroundColor: colors.grey[50],
    },
    drawerOpen: {
        width: 240,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerClose: {
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: 0,
    },
    root: {
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: theme.spacing(2),
    },
    divider: {
        margin: theme.spacing(2, 0),
        backgroundColor: colors.grey[900],
    },
    settings: {
        marginBottom: theme.spacing(2),
    },
    toolbar: {
        ...theme.mixins.toolbar,
        [theme.breakpoints.down('md')]: {
            display: 'none',
        },
    },
}));

const Sidebar = props => {
    const {open, variant, onClose, className, disableForm, ...rest} = props;
    const classes = useStyles();

    return (
        <Drawer
            className={clsx(classes.drawer, {
                [classes.drawerOpen]: open,
                [classes.drawerClose]: !open,
            })}
            classes={{
                paper: clsx(classes.drawerPaper, {
                    [classes.drawerOpen]: open,
                    [classes.drawerClose]: !open,
                }),
            }}
            onClose={onClose}
            open={open}
            variant={variant}
        >
            <div className={classes.toolbar} />
            <div {...rest} className={clsx(classes.root, className)}>
                <Info />
                <Divider className={classes.divider} />
                <SidebarSettings
                    className={classes.settings}
                    disableForm={disableForm}
                />
            </div>
        </Drawer>
    );
};

Sidebar.propTypes = {
    className: PropTypes.string,
    onClose: PropTypes.func,
    open: PropTypes.bool.isRequired,
    variant: PropTypes.string.isRequired,
    disableForm: PropTypes.bool,
};

export default Sidebar;
