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
}));

const Info = props => {
    const {className, ...rest} = props;
    const classes = useStyles();

    return (
        <div {...rest} className={clsx(classes.root, className)}>
            <div className={classes.title}>COVID-19 Model Settings</div>
        </div>
    );
};

Info.propTypes = {
    className: PropTypes.string,
};

export default Info;
