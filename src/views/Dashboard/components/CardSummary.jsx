import React from 'react';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {
    colors,
    Card,
    CardContent,
    Grid,
    Typography,
    Avatar,
} from '@material-ui/core';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import ErrorOutlineOutlinedIcon from '@material-ui/icons/ErrorOutlineOutlined';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import ReportOutlinedIcon from '@material-ui/icons/ReportOutlined';
import ReportProblemOutlinedIcon from '@material-ui/icons/ReportProblemOutlined';

const colorFromCardType = cardType => {
    let color;

    switch (cardType) {
        case 'red':
            color = colors.red[800];
            break;

        case 'orange':
            color = colors.orange[800];
            break;

        case 'yellow':
            color = colors.yellow[800];
            break;

        case 'gray':
            color = colors.grey[800];
            break;

        default:
            color = colors.grey[800];
            break;
    }

    return color;
};

const useStyles = makeStyles(theme => ({
    root: {
        height: '100%',
        borderLeft: ({cardType}) => {
            return `4px solid ${colorFromCardType(cardType)}`;
        },
    },
    content: {
        alignItems: 'center',
        display: 'flex',
    },
    title: {
        fontSize: '16px',
        fontWeight: 700,
    },
    avatar: {
        backgroundColor: ({cardType}) => {
            return colorFromCardType(cardType);
        },
        color: colors.common.white,
        height: 50,
        width: 50,
    },
    icon: {
        height: 32,
        width: 32,
    },
    difference: {
        marginTop: theme.spacing(2),
        display: 'flex',
        alignItems: 'center',
    },
    differenceIcon: {
        color: theme.palette.success.main,
    },
    differenceValue: {
        color: theme.palette.success.main,
        marginRight: theme.spacing(1),
    },
}));

const CardSummary = props => {
    const {className, cardType, count, minScore, maxScore, ...rest} = props;
    const classes = useStyles(props);
    let IconComponent = InfoOutlinedIcon;

    switch (cardType) {
        case 'red':
            IconComponent = ReportOutlinedIcon;
            break;

        case 'orange':
            IconComponent = ReportProblemOutlinedIcon;
            break;

        case 'yellow':
            IconComponent = ErrorOutlineOutlinedIcon;
            break;

        case 'gray':
            IconComponent = InfoOutlinedIcon;
            break;

        default:
            IconComponent = InfoOutlinedIcon;
            break;
    }

    return (
        <Card {...rest} className={clsx(classes.root, className)}>
            <CardContent>
                <Grid container justify="space-between">
                    <Grid item>
                        <Typography
                            className={classes.title}
                            color="textSecondary"
                            gutterBottom
                            variant="body2"
                        >
                            {minScore && maxScore
                                ? `${minScore} - ${maxScore}`
                                : 'Confirmed Fraud'}
                        </Typography>
                        <Typography variant="h3">
                            {count} {count === 1 ? 'Card' : 'Cards'}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Avatar className={classes.avatar}>
                            <IconComponent className={classes.icon} />
                        </Avatar>
                    </Grid>
                </Grid>
                <div className={classes.difference}>
                    <ArrowDownwardIcon className={classes.differenceIcon} />
                    <Typography
                        className={classes.differenceValue}
                        variant="body2"
                    >
                        {Math.floor(Math.random() * 40) + 1}%
                    </Typography>
                    <Typography className={classes.caption} variant="caption">
                        from yesterday
                    </Typography>
                </div>
            </CardContent>
        </Card>
    );
};

CardSummary.propTypes = {
    className: PropTypes.string,
    count: PropTypes.number.isRequired,
    minScore: PropTypes.number,
    maxScore: PropTypes.number,
    cardType: PropTypes.oneOf(['red', 'orange', 'yellow', 'gray']).isRequired,
};

export default CardSummary;
