import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {AppBar, Toolbar} from '@material-ui/core';

const useStyles = makeStyles(() => ({
    root: {
        boxShadow: 'none',
    },
    logo: {
        height: '30px',
        marginTop: '5px',
    },
}));

const Topbar = props => {
    const {className, ...rest} = props;
    const classes = useStyles();

    return (
        <AppBar
            {...rest}
            className={clsx(classes.root, className)}
            color="primary"
            position="fixed"
        >
            <Toolbar>COVID-19</Toolbar>
        </AppBar>
    );
};

Topbar.propTypes = {
    className: PropTypes.string,
};

export default Topbar;
