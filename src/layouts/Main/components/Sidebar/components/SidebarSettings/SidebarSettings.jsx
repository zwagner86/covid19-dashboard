/* eslint-disable react/no-multi-comp */
/* eslint-disable react/display-name */
import React from 'react';
// import clsx from 'clsx';
// import PropTypes from 'prop-types';
// import {makeStyles} from '@material-ui/styles';

/* const useStyles = makeStyles(theme => ({
    root: {},
    item: {
        display: 'flex',
        paddingTop: 0,
        paddingBottom: 0,
    },
    button: {
        color: colors.blueGrey[800],
        padding: '10px 8px',
        justifyContent: 'flex-start',
        textTransform: 'none',
        letterSpacing: 0,
        width: '100%',
        fontWeight: theme.typography.fontWeightMedium,
    },
    icon: {
        color: theme.palette.icon,
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        marginRight: theme.spacing(1),
    },
    active: {
        color: theme.palette.primary.main,
        fontWeight: theme.typography.fontWeightMedium,
        '& $icon': {
            color: theme.palette.primary.main,
        },
    },
})); */

const SidebarSettings = props => {
    // const {className, ...rest} = props;
    // const classes = useStyles();

    /* return (
        <List {...rest} className={clsx(classes.root, className)}>
            {pages.map(page => (
                <ListItem
                    className={classes.item}
                    disableGutters
                    key={page.title}
                >
                    <Button
                        activeClassName={classes.active}
                        className={classes.button}
                        component={CustomRouterLink}
                        to={page.href}
                    >
                        <div className={classes.icon}>{page.icon}</div>
                        {page.title}
                    </Button>
                </ListItem>
            ))}
        </List>
    );*/
    return <div>Settings will go here</div>;
};

SidebarSettings.propTypes = {
    // className: PropTypes.string,
};

export default SidebarSettings;
