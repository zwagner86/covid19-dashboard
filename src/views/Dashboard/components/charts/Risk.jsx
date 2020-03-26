import React, {useState} from 'react';
import {Line} from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
import clsx from 'clsx';
import PropTypes from 'prop-types';
import numeral from 'numeral';
import {makeStyles} from '@material-ui/styles';
import {
    colors,
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
        height: '100%',
    },
    chartContainer: {
        position: 'relative',
        height: 400,
    },
}));

const Risk = props => {
    const {
        className,
        type,
        title,
        chartLabels,
        chartData,
        worryLevel,
        defaultChartScale,
        ...rest
    } = props;
    const classes = useStyles();
    const [lineType, setLineType] = useState(
        defaultChartScale === 'log' ? 'logarithmic' : 'linear'
    );

    const handleChange = event => {
        setLineType(event.target.value);
    };

    const chartDataset = {
        labels: chartLabels,
        datasets: [
            {
                label:
                    type === '1plus'
                        ? 'Risk 1-Plus Encounters'
                        : 'Cumulative Risk',
                fill: true,
                lineTension: 0.1,
                borderColor:
                    type === '1plus' ? colors.blue[600] : colors.orange[800],
                pointBorderColor:
                    type === '1plus' ? colors.blue[600] : colors.orange[800],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor:
                    type === '1plus' ? colors.blue[600] : colors.orange[800],
                pointHoverBorderColor: colors.grey[50],
                pointHoverBorderWidth: 2,
                pointRadius: 3,
                pointHitRadius: 10,
                data: chartData,
            },
        ],
    };

    const options = {
        scales: {
            xAxes: [
                {
                    display: true,
                    ticks: {
                        callback: (dataLabel, index) => {
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
        annotation: {
            annotations: [
                {
                    drawTime: 'beforeDatasetsDraw',
                    id: 'hline',
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: worryLevel / 100,
                    borderColor: colors.common.black,
                    borderWidth: 2,
                    label: {
                        backgroundColor: colors.grey[600],
                        content: 'Risk Cutoff',
                        enabled: true,
                    },
                },
            ],
        },
        maintainAspectRatio: false,
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
                    <Line data={chartDataset} options={options} redraw />
                </div>
            </CardContent>
        </Card>
    );
};

Risk.propTypes = {
    className: PropTypes.string,
    type: PropTypes.oneOf(['1plus', 'cumulative']).isRequired,
    title: PropTypes.string.isRequired,
    chartLabels: PropTypes.array.isRequired,
    chartData: PropTypes.array.isRequired,
    worryLevel: PropTypes.number,
    defaultChartScale: PropTypes.oneOf(['linear', 'log']),
};

export default Risk;
