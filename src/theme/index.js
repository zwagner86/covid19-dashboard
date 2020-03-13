import {createMuiTheme} from '@material-ui/core';

import palette from './palette';
import typography from './typography';
import overrides from './overrides';

const theme = createMuiTheme({
    palette,
    typography,
    overrides,
    mixins: {
        toolbar: {
            minHeight: 48,
        },
    },
    props: {
        MuiToolbar: {
            variant: 'dense',
        },
    },
    zIndex: {
        appBar: 1200,
        drawer: 1100,
    },
});

export default theme;
