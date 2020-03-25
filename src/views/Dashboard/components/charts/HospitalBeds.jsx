import some from 'lodash/some';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import numeral from 'numeral';
import {Line} from 'react-chartjs-2';
import 'chartjs-plugin-annotation';
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

const HospitalBeds = props => {
    const {
        className,
        title,
        chartLabels,
        chartData,
        hospitalBedCapacity,
        ...rest
    } = props;
    const classes = useStyles();
    const [lineType, setLineType] = useState('linear');

    const handleChange = event => {
        setLineType(event.target.value);
    };

    const chartDataset = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Occupied Hospital Beds',
                fill: false,
                lineTension: 0.1,
                borderColor: colors.orange[800],
                pointBorderColor: colors.orange[800],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colors.orange[800],
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
                    label += `${numeral(tooltipItem.yLabel).format(
                        '0,0'
                    )} occupied beds`;

                    return label;
                },
            },
        },
        maintainAspectRatio: false,
    };

    const bedsNearTotalBeds = some(chartData, usedBeds => {
        return usedBeds > hospitalBedCapacity * 0.6;
    });

    if (bedsNearTotalBeds) {
        const annotation = {
            annotations: [
                {
                    drawTime: 'beforeDatasetsDraw',
                    id: 'hline',
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: hospitalBedCapacity,
                    borderColor: colors.common.black,
                    borderWidth: 2,
                    label: {
                        backgroundColor: colors.grey[600],
                        content: 'Hospital Bed Capacity',
                        enabled: true,
                    },
                },
            ],
        };

        options.annotation = annotation;
    }

    if (lineType === 'linear') {
        options.scales.yAxes[0].ticks = {
            callback: (value, index, values) => {
                return lineType === 'linear'
                    ? numeral(value).format('0,0')
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

HospitalBeds.propTypes = {
    className: PropTypes.string,
    title: PropTypes.string.isRequired,
    chartLabels: PropTypes.array.isRequired,
    chartData: PropTypes.array.isRequired,
    hospitalBedCapacity: PropTypes.number,
};

export default HospitalBeds;
