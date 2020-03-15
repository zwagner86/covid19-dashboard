import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import {makeStyles} from '@material-ui/styles';
import {
    Card,
    CardHeader,
    CardContent,
    Divider,
    FormControl,
    Select,
    MenuItem,
} from '@material-ui/core';

const useStyles = makeStyles(theme => ({
    root: {
        marginTop: theme.spacing(4),
        height: '100%',
    },
    chartContainer: {
        position: 'relative',
    },
}));

const Risk = props => {
    const {className, chartData, type, title, ...rest} = props;
    const classes = useStyles();
    const [lineType, setLineType] = useState('linear');

    const handleChange = event => {
        setLineType(event.target.value);
    };

    const options = {
        scales: {
            xAxes: [
                {
                    display: true,
                    ticks: {
                        callback: (dataLabel, index) => {
                            // Hide the label of every 2nd dataset. return null to hide the grid line too
                            return index % 4 === 0 ? dataLabel : '';
                        },
                    },
                },
            ],
            yAxes: [
                {
                    display: true,
                    type: lineType,
                },
            ],
        },
        tooltips: {
            callbacks: {
                label: (tooltipItem, data) => {
                    let label =
                        data.datasets[tooltipItem.datasetIndex].label || '';

                    if (label) {
                        label += ': ';
                    }
                    label += numeral(tooltipItem.yLabel).format(
                        `0.0${type === 'cumulative' ? '0' : ''}%`
                    );

                    return label;
                },
            },
        },
    };

    if (lineType === 'linear') {
        options.scales.yAxes[0].ticks = {
            callback: (value, index, values) => {
                return lineType === 'linear'
                    ? numeral(value).format(
                          `0.0${type === 'cumulative' ? '0' : ''}%`
                      )
                    : value;
            },
        };
    }

    return (
        <Card {...rest} className={clsx(classes.root, className)}>
            <CardHeader
                title={title}
                action={
                    <FormControl className={classes.formControl}>
                        <Select
                            labelId="line-type-select-label"
                            id="line-type-select"
                            value={lineType}
                            onChange={handleChange}
                        >
                            <MenuItem value="linear">Linear</MenuItem>
                            <MenuItem value="logarithmic">Logarithmic</MenuItem>
                        </Select>
                    </FormControl>
                }
            />
            <Divider />
            <CardContent>
                <div className={classes.chartContainer}>
                    <Line data={chartData} options={options} />
                </div>
            </CardContent>
        </Card>
    );
};

Risk.propTypes = {
    className: PropTypes.string,
    type: PropTypes.oneOf(['1plus', 'cumulative']).isRequired,
    title: PropTypes.string.isRequired,
    chartData: PropTypes.object.isRequired,
    worryLevel: PropTypes.number,
};

export default Risk;
