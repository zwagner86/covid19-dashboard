import some from 'lodash/some';
import React, {useState} from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import numeral from 'numeral';
import {Line} from 'react-chartjs-2';
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

const ProjectedCases = props => {
    const {
        className,
        chartLabels,
        projectionsData,
        cdcData,
        population,
        ...rest
    } = props;
    const classes = useStyles();
    const [lineType, setLineType] = useState('linear');

    const chartDatasets = {
        labels: chartLabels,
        datasets: [
            {
                label: 'Projected Cases',
                fill: false,
                lineTension: 0.1,
                borderColor: colors.blue[600],
                pointBorderColor: colors.blue[600],
                pointBackgroundColor: '#fff',
                pointBorderWidth: 1,
                pointHoverRadius: 5,
                pointHoverBackgroundColor: colors.blue[600],
                pointHoverBorderColor: colors.grey[50],
                pointHoverBorderWidth: 2,
                pointRadius: 3,
                pointHitRadius: 10,
                data: projectionsData,
            },
        ],
    };

    if (cdcData && cdcData.length > 0) {
        const cdcDataset = {
            label: 'CDC Cases Scaled',
            fill: false,
            lineTension: 0.1,
            borderColor: colors.red[600],
            pointBorderColor: colors.red[600],
            pointBackgroundColor: '#fff',
            pointBorderWidth: 1,
            pointHoverRadius: 5,
            pointHoverBackgroundColor: colors.red[600],
            pointHoverBorderColor: colors.grey[50],
            pointHoverBorderWidth: 2,
            pointRadius: 3,
            pointHitRadius: 10,
            data: cdcData,
        };

        chartDatasets.datasets.push(cdcDataset);
    }

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

                    label += numeral(tooltipItem.yLabel).format('0,0');

                    return label;
                },
            },
        },
        maintainAspectRatio: false,
    };

    const projectionsNearTotalPop = some(projectionsData, projectedCases => {
        return projectedCases > population * 0.6;
    });

    const cdcNearTotalPop = some(cdcData, cdcCases => {
        return cdcCases > population * 0.6;
    });

    if (projectionsNearTotalPop || cdcNearTotalPop) {
        const annotation = {
            annotations: [
                {
                    drawTime: 'beforeDatasetsDraw',
                    id: 'hline',
                    type: 'line',
                    mode: 'horizontal',
                    scaleID: 'y-axis-0',
                    value: population,
                    borderColor: colors.common.black,
                    borderWidth: 2,
                    label: {
                        backgroundColor: colors.grey[600],
                        content: 'Population',
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
                title="Projected Cases"
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
                    <Line data={chartDatasets} options={options} redraw />
                </div>
            </CardContent>
        </Card>
    );
};

ProjectedCases.propTypes = {
    className: PropTypes.string,
    chartLabels: PropTypes.array.isRequired,
    projectionsData: PropTypes.array.isRequired,
    cdcData: PropTypes.array.isRequired,
    population: PropTypes.number.isRequired,
};

export default ProjectedCases;
