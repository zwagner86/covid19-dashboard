import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';

const useStyles = makeStyles(theme => ({
    root: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: 'fit-content',
    },
    title: {
        marginBottom: theme.spacing(1),
    },
    info: {
        marginTop: theme.spacing(1),
    },
}));

const Info = props => {
    const {className, ...rest} = props;
    const classes = useStyles();

    return (
        <div {...rest} className={clsx(classes.root, className)}>
            <div className={classes.title}>Covid-19</div>
            <div className={classes.info}>Info for settings form here</div>
        </div>
    );
};

Info.propTypes = {
    className: PropTypes.string,
};

export default Info;
