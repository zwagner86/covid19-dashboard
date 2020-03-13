import React, {forwardRef} from 'react';
import MaterialTableComponent from 'material-table';
import AddIcon from '@material-ui/icons/Add';
import ArrowDownwardIcon from '@material-ui/icons/ArrowDownward';
import CheckIcon from '@material-ui/icons/Check';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import ClearIcon from '@material-ui/icons/Clear';
import DeleteOutlineIcon from '@material-ui/icons/DeleteOutline';
import EditIcon from '@material-ui/icons/Edit';
import FilterListIcon from '@material-ui/icons/FilterList';
import FirstPageIcon from '@material-ui/icons/FirstPage';
import LastPageIcon from '@material-ui/icons/LastPage';
import RemoveIcon from '@material-ui/icons/Remove';
import SaveAltIcon from '@material-ui/icons/SaveAlt';
import SearchIcon from '@material-ui/icons/Search';
import ViewColumnIcon from '@material-ui/icons/ViewColumn';

const tableIcons = {
    Add: forwardRef((props, ref) => <AddIcon {...props} ref={ref} />),
    Check: forwardRef((props, ref) => <CheckIcon {...props} ref={ref} />),
    Clear: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Delete: forwardRef((props, ref) => (
        <DeleteOutlineIcon {...props} ref={ref} />
    )),
    DetailPanel: forwardRef((props, ref) => (
        <ChevronRightIcon {...props} ref={ref} />
    )),
    Edit: forwardRef((props, ref) => <EditIcon {...props} ref={ref} />),
    Export: forwardRef((props, ref) => <SaveAltIcon {...props} ref={ref} />),
    Filter: forwardRef((props, ref) => <FilterListIcon {...props} ref={ref} />),
    FirstPage: forwardRef((props, ref) => (
        <FirstPageIcon {...props} ref={ref} />
    )),
    LastPage: forwardRef((props, ref) => <LastPageIcon {...props} ref={ref} />),
    NextPage: forwardRef((props, ref) => (
        <ChevronRightIcon {...props} ref={ref} />
    )),
    PreviousPage: forwardRef((props, ref) => (
        <ChevronLeftIcon {...props} ref={ref} />
    )),
    ResetSearch: forwardRef((props, ref) => <ClearIcon {...props} ref={ref} />),
    Search: forwardRef((props, ref) => <SearchIcon {...props} ref={ref} />),
    SortArrow: forwardRef((props, ref) => (
        <ArrowDownwardIcon {...props} ref={ref} />
    )),
    ThirdStateCheck: forwardRef((props, ref) => (
        <RemoveIcon {...props} ref={ref} />
    )),
    ViewColumn: forwardRef((props, ref) => (
        <ViewColumnIcon {...props} ref={ref} />
    )),
};

const MaterialTable = props => {
    return <MaterialTableComponent {...props} />;
};

MaterialTable.defaultProps = {
    icons: tableIcons,
};

export default MaterialTable;
